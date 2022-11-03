import express from "express";
// import data from "./data.js";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
// import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import logRouter from "./routes/logRoutes.js";
import expressAsyncHandler from "express-async-handler";
import { isAuth } from "./utils.js";

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

app.use(cors()); //enable cross origin resource sharing
//used for POST/PUT so as to read the data being POSTed
app.use(express.json()); //parse the body from post request EXCEPT from html post form
app.use(express.urlencoded({ extended: true })); //to then enable parsing of the body from HTML post form

app.get(
  "/api/keys/paypal",
  isAuth,
  expressAsyncHandler((req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || "sb"); //return sandbox if no client id
  })
);

// app.use("/api/seed", seedRouter); //if route matches /api/seed -> callback
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/test", logRouter); 

//for express async handler (used in userRoutes)
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, (req, res) => {
  console.log(`Server is up at: http://localhost:${port}`);
});

process.on("SIGINT", function () {
  process.exit();
});
