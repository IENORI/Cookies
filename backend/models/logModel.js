import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    user: { type: String, required: false },
    isAdmin: { type: Boolean, default: false, required: true },
    statusCode : { type: String, required: true },
    activity: { type: String, required: true },
    accessedAt: { type: Date }
  },
  {
    timestamps: true,
  }
);

const logModel = mongoose.model("Log", logSchema); //name of collection and model
export default logModel;
