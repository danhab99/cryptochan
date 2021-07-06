import { NextApiRequest, NextApiResponse } from "next";
import immutable from "../../../middlewares/immutable";
import connectDB from "../../../middlewares/mongoose";
import { sanatizeDB } from "../../../sanatizeQuery";
import { Thread } from "../../../schemas/Thread";
import LoggingFactory from "../../../middlewares/logging";

const ThreadAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "API Thread");
  await connectDB();

  log("Getting thread", req.query);

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
        log("Got thread");
        if (!req.query.replies) {
          immutable(req, res);
        }
        res.json(thread);
      } else {
        log("Thread not found", req.query);
        res.status(404).send("Not found");
      }
    })
    .catch((e) => {
      log("Error", e);
      res.status(500).json(e);
    });
};

export default ThreadAPI;
