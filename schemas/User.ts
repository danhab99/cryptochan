import mongoose, { model, Schema, Model, Document } from "mongoose";

interface IUser extends Document {
  publickey: {
    algorithm: string;
    key: string;
  };
  name: string;
  profilepic: {
    hash: string;
    algorithm: string;
    mimetype: string;
    size: string;
  };
  description: string;
  verify: string;
}

const UserSchema: Schema = new Schema({
  publickey: {
    algorithm: String,
    key: String,
  },
  name: String,
  profilepic: {
    hash: String,
    algorithm: String,
    mimetype: String,
    size: String,
  },
  description: String,
  verify: String,
});

export const User: Model<IUser> =
  mongoose.models.Users || model("user", UserSchema);
