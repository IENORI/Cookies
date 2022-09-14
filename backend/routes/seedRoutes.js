import express from "express";
import Product from "../models/productModel.js";
import data from "../data.js";
import User from "../models/userModel.js";

const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  //seeding products
  await Product.remove({}); //removing all records in model
  const createdProducts = await Product.insertMany(data.products); //inserting products into database and return inserted products

  //seeding users
  await User.remove({});
  const createdUsers = await User.insertMany(data.users);
  res.send({ createdProducts, createdUsers }); //send created product to page
});

export default seedRouter;
