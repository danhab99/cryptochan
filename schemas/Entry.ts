import mongoose, { model, Schema, Model, Document } from "mongoose";

export interface IEmbed {
  hash: string;
  algorithm: string;
  mimetype: string;
  size: string;
}

export interface IEntrySimple {
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

export type IEntry = Document<IEntrySimple>;

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
  mongoose.models.Entry || model("Entry", EntrySchema);

Entry.countDocuments().then((count) => {
  if (count <= 0) {
    console.log("Createing seed posts");
    Entry.insertMany([
      {
        author: {
          name: "test 1",
          publickey: "sadfkjasdfpohjasdfkpjnb",
        },
        hash: {
          algorithm: "sha256",
          value: "asdfkjnasdfpkjnasdfkhjasdfk;jsfad",
        },
        signature: "sadfsadfnjasfkjsafk",
        parenthash: "",
        replies: true,
        body: {
          mimetype: "text/plain",
          content: "This is a test post",
        },
        published: new Date(),
        category: "cat1",
        tag: ["t1", "t2", "t3"],
        embeds: [
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
        ],
      },
      {
        author: {
          name: "test 2",
          publickey: "sadfkjasdfpohjasdfkpjnb",
        },
        hash: {
          algorithm: "sha256",
          value: "asdfkjnasdfpkjnasdfkhjasdfk;jsfad",
        },
        signature: "sadfsadfnjasfkjsafk",
        parenthash: "",
        replies: true,
        body: {
          mimetype: "text/plain",
          content: "This is a test post",
        },
        published: new Date(),
        category: "cat1",
        tag: ["t1", "t2", "t3"],
        embeds: [
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
        ],
      },
      {
        author: {
          name: "test 3",
          publickey: "sadfkjasdfpohjasdfkpjnb",
        },
        hash: {
          algorithm: "sha256",
          value: "asdfkjnasdfpkjnasdfkhjasdfk;jsfad",
        },
        signature: "sadfsadfnjasfkjsafk",
        parenthash: "",
        replies: true,
        body: {
          mimetype: "text/plain",
          content: "This is a test post",
        },
        published: new Date(),
        category: "cat2",
        tag: ["t1", "t2", "t3"],
        embeds: [
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
          {
            algorithm: "sha256",
            hash: "sdfibjsadfipuhsdf",
            mimetype: "application/null",
            size: "1b",
          },
        ],
      },
    ]);
  }
});
