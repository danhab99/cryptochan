import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import { sanatizeDB } from "../../../sanatizeQuery";
import { Thread } from "../../../schemas/Thread";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  sanatizeDB(
    Thread.find({
      [req.query.replies ? "parenthash" : "hash.value"]: req.query
        .hash as string,
    })
      .skip(parseInt((req.query.skip as string) || "0"))
      .limit(Math.min(10, parseInt((req.query.take as string) || "10")))
  )
    .then((thread) => {
      if (thread) {
        if (!req.query.replies) {
          res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        }
        res.json(thread);
      } else {
        res.status(404).json(new Error("Not found"));
      }
    })
    .catch((e) => {
      res.status(500).json(e);
    });
};
