import express from "express";
import Product from "../models/productModel.js";
import expressAsyncHandler from 'express-async-handler';
import multer from 'multer';
import { isAuth } from "../utils.js";

const productRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../frontend/public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.replace(/\s/g, ''));
  },
});

const upload = multer({ storage: storage });

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
  '/update/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name || product.name;
      product.price = req.body.price || product.price;
      product.countInStock = req.body.quantity || product.countInStock;
      product.description = req.body.description || product.description;
      const updatedProduct = await product.save();
      const updatedProducts = await Product.find();
      res.send(updatedProducts);
    } else {
      res.status(404).send({ message: 'Prouct not found' });
    }
  })
);

productRouter.post(
  '/add',
  isAuth,
  upload.single('imageFile'),
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: req.body.name,
      slug: req.body.name,
      image: req.body.imagePath,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      countInStock: req.body.quantity,
    });
    const product = await newProduct.save();
    const products = await Product.find();
    res.send(products);
  })
);

productRouter.delete(
  '/delete/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id
    const product = await Product.findByIdAndRemove(id).exec();
    res.send("product deleted");
    return;
  })
);

export default productRouter;
