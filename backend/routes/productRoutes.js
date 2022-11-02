import express from "express";
import Product from "../models/productModel.js";
import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import { isAuth } from "../utils.js";
import dotenv from "dotenv";
import Log from '../models/logModel.js';


dotenv.config(); //to fetch variables

const productRouter = express.Router();

const spaceEndPoint = new aws.Endpoint(process.env.SPACES_ENDPOINT);
const s3 = new aws.S3({
  endpoint: spaceEndPoint,
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY,
});

const S3URL =
  "https://" +
  process.env.SPACES_BUCKET +
  "." +
  process.env.SPACES_ENDPOINT +
  "/";
var dynamicFileName;
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.SPACES_BUCKET,
    acl: "public-read",
    key: function (request, file, cb) {
      const fileName = file.originalname + "-" + String(Date.now()) + ".png";
      dynamicFileName = fileName;
      cb(null, fileName);
    },
  }),
});

//the / appends onto the app.use route that is called
productRouter.get("/", async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

productRouter.get("/slug/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product not found" });
  }
});

productRouter.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product not found" });
  }
});

productRouter.put(
  "/update/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const updateProductLog = new Log({
      user: req.user._id,
      isAdmin: req.user.isAdmin,
      statusCode: "200",
      activity: "Admin Successfully Updated Product: "+ product.name,
    })
    const updateProductFLog = new Log({
      user: req.user._id,
      isAdmin: req.user.isAdmin,
      statusCode: "404",
      activity: product.name + " not found.",
    })
    const unauthorizedLog = new Log({
      user: req.user._id,
      isAdmin: req.user.isAdmin,
      statusCode: "401",
      activity: "Unauthorized Access",
    })

    if (req.user.isAdmin) {
      if (product) {
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.countInStock = req.body.quantity || product.countInStock;
        product.description = req.body.description || product.description;
        const updatedProduct = await product.save();
        const updatedProducts = await Product.find();
        res.send(updatedProducts);
        await updateProductLog.save();
      } else {
        res.status(404).send({ message: "Product not found" });
        await updateProductFLog.save();

      }
    } else {
      //if user is not admin
      res.status(401).send({ message: "UNAUTHORIZED ACCESS" });
      await unauthorizedLog.save();
    }
  })
);

productRouter.post(
  "/add",
  isAuth,
  upload.single("imageFile"),
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      const newProduct = new Product({
        name: req.body.name,
        slug: req.body.name,
        image: S3URL + dynamicFileName,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        countInStock: req.body.quantity,
      });
      const product = await newProduct.save();
      const products = await Product.find();
      res.send(products);
    } else {
      //if user is not admin
      res.status(404).send({ message: "UNAUTHORIZED ACCESS" });
    }
  })
);

productRouter.delete(
  "/delete/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      const id = req.params.id;
      const product = await Product.findByIdAndRemove(id).exec();
      res.send("Product deleted");
      return;
    } else {
      res.status(404).send({ message: "UNAUTHORIZED ACCESS" });
    }
  })
);

export default productRouter;
