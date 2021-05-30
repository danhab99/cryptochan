import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  if (!process.env.MONGO_SRV) {
    throw new Error("Must set mongo srv");
  }

  return await mongoose.connect(process.env.MONGO_SRV, {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
  });
};

export default connectDB;
