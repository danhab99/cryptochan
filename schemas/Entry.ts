import mongoose, { model, Schema, Model, Document } from "mongoose";

interface IEmbed {
  hash: string;
  algorithm: string;
  mimetype: string;
  size: string;
}

export interface IEntry extends Document {
  author: {
    name: string;
    publickey: string;
  };
  hash: {
    algorithm: string;
    value: string;
  };
  signature: string;
  parenthash: string;
  replies: boolean;
  body: {
    mimetype: string;
    content: string;
  };
  published: Date;
  category: string;
  tag: string[];
  embeds: IEmbed[];
}

const EmbedSchema: Schema = new Schema({
  hash: String,
  algorithm: String,
  mimetype: String,
  size: String,
});

const EntrySchema: Schema = new Schema({
  author: {
    name: String,
    publickey: String,
  },
  hash: {
    algorithm: String,
    value: String,
  },
  signature: String,
  parenthash: String,
  replies: {
    type: Boolean,
    default: false,
  },
  body: {
    mimetype: String,
    content: String,
  },
  published: Date,
  category: String,
  tag: [{ type: String }],
  embeds: [{ type: EmbedSchema }],
});

export const Entry: Model<IEntry> =
  mongoose.models.Users || model("Entry", EntrySchema);
