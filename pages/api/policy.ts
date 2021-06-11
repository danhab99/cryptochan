import { NextApiRequest, NextApiResponse } from "next";
import { Policy } from "../../policy";

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  res.json(Policy);
};
