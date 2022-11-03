import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    temp_secret: { type: String, required: false }, // to store otp
    login_id: { type: String, required: false }, // to store unique id on each login 
    isAdmin: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema); //name of collection and model
export default User;
