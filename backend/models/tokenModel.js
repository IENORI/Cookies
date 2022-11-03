import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // this is the expiry time in seconds = 3600 ~ 1 hr
});

const tokenModel = mongoose.model('Token', tokenSchema); //name of collection and model
export default tokenModel;
