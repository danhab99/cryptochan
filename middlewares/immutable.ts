import { NextApiRequest, NextApiResponse } from "next";

export default function (_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
}
