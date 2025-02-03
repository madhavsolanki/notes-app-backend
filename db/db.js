import mongoose from "mongoose";


// Db Setup
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log("MongoDB Successfully Connected");
  } catch (error) {
    console.log("MongoDB connection error: " + error.message);
    process.exit(1);
  }
};


export default connectDB;