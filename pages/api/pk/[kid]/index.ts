import { NextApiRequest, NextApiResponse } from "next";
import immutable from "../../../../middlewares/immutable";
import connectDB from "../../../../middlewares/mongoose";
import { PublicKey } from "../../../../schemas/PublicKey";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  immutable(req, res);

  PublicKey.findOne({ keyid: req.query.kid as string })
    .then((pk) => {
      if (pk) {
        res.send(pk.key);
      } else {
        res.status(404).send("Not found");
      }
    })
    .catch((e: Error) => {
      res.status(500).send(e.message);
    });
};
