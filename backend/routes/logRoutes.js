import express from "express";
import dotenv from "dotenv";
import logModel from "../models/logModel.js";

dotenv.config(); //to fetch variables

const logRouter = express.Router();

//the / appends onto the app.use route that is called
logRouter.get("/", async (req, res) => {
  const logs = await logModel.find();
  res.send(logs);
});

export default logRouter;
 
