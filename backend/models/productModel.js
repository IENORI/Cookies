import mongoose from "mongoose";

//schema, options
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema); //name of collection and model

export default Product;
