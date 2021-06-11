import mongoose, { model, Schema, Model, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  userID: string;
  comment: string;
}

interface IPublicKey extends Document {
  key: string;
  fingerprint: string;
  keyid: string;
  owner: IUser;
  approved: boolean;
}

const UserSchema: Schema = new Schema({
  name: String,
  email: String,
  userID: String,
  comment: String,
});

const PublicKeySchema: Schema = new Schema({
  key: String,
  fingerprint: String,
  keyid: String,
  owner: UserSchema,
  approved: {
    type: Boolean,
    default: false,
  },
});

export const PublicKey: Model<IPublicKey> =
  mongoose.models.publickey || model("publickey", PublicKeySchema);
