import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import { PublicKey } from "../../../schemas/PublicKey";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  PublicKey.findOne({ keyid: req.query.kid as string })
    .then((pk) => {
      if (pk) {
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.end(pk.key);
      } else {
        res.status(404).json(new Error("Not found"));
      }
    })
    .catch((e) => {
      res.status(500).json(e);
    });
};
