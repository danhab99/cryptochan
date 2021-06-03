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
}

export function GetPolicy(): IPolicy {
  return {
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
  };
}
