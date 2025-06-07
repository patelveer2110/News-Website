import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI", MONGO_URI);

const connectdb =  async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export default connectdb;