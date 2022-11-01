import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    accessedAt: { type: Date },
    activity: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const logModel = mongoose.model("Log", logSchema); //name of collection and model
export default logModel;
