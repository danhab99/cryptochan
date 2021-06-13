import { IPolicy } from "../IPolicy";

const policy: IPolicy = {
  approve_posts: true,
  publickey: {
    preapproved: true,
    require: true,
  },
  embeds: ["image/webp", "video/webm"],
  maxEmbeds: 3,
  maxSize: 1e7,
  rules: [
    "Posting is limited to only those with approved public keys",
    "No porn",
    "No gore",
    "No death",
    "No doxxing",
  ],
  categories: [
    {
      name: "all",
      title: "All",
      description: "Welcomes all posts",
    },
  ],
  hash_algo: "SHA-256",
  maxLength: 1e5,
};

console.log(JSON.stringify(policy));
