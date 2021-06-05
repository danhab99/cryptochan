interface IPolicy {
  publickey: {
    require: boolean;
    preapproved: boolean;
  };
  approve_posts: boolean;
  rules: string[];
  embeds: string[];
  maxEmbeds: number;
  maxSize: number;
  categories: string[];
  hash_algo: "SHA-256" | "SHA-384" | "SHA_512";
}

export const Policy: IPolicy = {
  approve_posts: true,
  publickey: {
    preapproved: true,
    require: true,
  },
  embeds: ["image/webp", "video/webm"],
  maxEmbeds: 3,
  maxSize: 1e6,
  rules: ["No porn"],
  categories: ["all", "test"],
  hash_algo: "SHA-256",
};
