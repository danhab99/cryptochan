import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import { sanatizeDB } from "../../../sanatizeQuery";
import { Thread } from "../../../schemas/Thread";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  console.log("Getting Thread", req.query);

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
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        res.json(thread);
      } else {
        res.writeHead(404).end("Not found");
      }
    })
    .catch((e) => {
      res.writeHead(500);
      res.end(JSON.stringify(e));
    });
};
