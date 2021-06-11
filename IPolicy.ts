export interface Category {
  name: string;
  title: string;
  description: string;
}

export interface IPolicy {
  publickey: {
    require: boolean;
    preapproved: boolean;
  };
  approve_posts: boolean;
  rules: string[];
  embeds: string[];
  maxEmbeds: number;
  maxSize: number;
  maxLength: number;
  categories: Category[];
  hash_algo: "SHA-256" | "SHA-384" | "SHA_512";
}
