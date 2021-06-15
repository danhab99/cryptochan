import mongoose, { model, Schema, Model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  userID: string;
  comment: string;
}

export interface IPublicKey extends Document {
  key: string;
  fingerprint: string;
  keyid: string;
  owner: IUser;
  approved: boolean;
  revoked: boolean;
  signingKey: String;
  signingKeyID: String;
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
  keyid: {
    type: String,
    unique: true,
  },
  owner: UserSchema,
  approved: {
    type: Boolean,
    default: false,
  },
  revoked: Boolean,
  signingKey: String,
  signingKeyID: String,
});

export const PublicKey: Model<IPublicKey> =
  mongoose.models.publickey || model("publickey", PublicKeySchema);
