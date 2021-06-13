import mongoose, { model, Schema, Model, Document } from "mongoose";

export interface IEmbed {
  hash: string;
  algorithm: string;
  mimetype: string;
  size: string;
}

export interface IThreadSimple {
  author: {
    name: string;
    publickey: string;
  };
  hash: {
    algorithm: string;
    value: string;
  };
  signature: string;
  parenthash: string | undefined;
  replies: boolean;
  body: {
    mimetype: string;
    content: string;
  };
  published: Date;
  category: string;
  embeds: IEmbed[];
  url: string;
}

export interface IThread extends IThreadSimple, Document {}

const EmbedSchema: Schema = new Schema({
  hash: String,
  algorithm: String,
  mimetype: String,
  size: String,
});

const ThreadSchema: Schema = new Schema({
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
  embeds: [{ type: EmbedSchema }],
  url: String,
  approved: {
    type: Boolean,
    default: false,
  },
});

export const Thread: Model<IThread> =
  mongoose.models.Thread || model("Thread", ThreadSchema);
