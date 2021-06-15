import { NextApiRequest, NextApiResponse } from "next";
import immutable from "../../../middlewares/immutable";
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
          immutable(req, res);
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
