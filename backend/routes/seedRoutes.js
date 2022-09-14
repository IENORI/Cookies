import express from "express";
import Product from "../models/productModel.js";
import data from "../data.js";

const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  await Product.remove({}); //removing all records in model
  const createdProducts = await Product.insertMany(data.products); //inserting products into database and return inserted products
  res.send({ createdProducts }); //send created product to page
});

export default seedRouter;
