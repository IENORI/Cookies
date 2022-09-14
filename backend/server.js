import express from "express";
import data from "./data.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";

dotenv.config(); //to fetch variables

//connect to mongodb, mongoose.connect returns promise, so can then
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();
app.use("/api/seed", seedRouter); //if route matches /api/seed -> callback
app.use("/api/products", productRouter);

const port = process.env.PORT || 5000;
app.listen(port, (req, res) => {
  console.log(`Server is up at: http://localhost:${port}`);
});
