import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../../middlewares/mongoose";
import { getThreadsAndReplies } from "../../../../query/getThreadsAndReplies";
import { sanatizeParams } from "../../../../sanatizeQuery";
import LoggingFactory from "../../../../middlewares/logging";

const PKThreadsAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "PK Threads");
  await connectDB();
  const page = parseInt(sanatizeParams(req.query.page, "0"));
  const pk = sanatizeParams(req.query.kid);

  log("Getting threads by public key", pk, page);

  if (!pk) {
    log("Unknown public key");
    res.status(406).send("Unknow key");
    return;
  }

  const { threadsAndReplies, more } = await getThreadsAndReplies(
    { type: "publickey", pk },
    { page }
  );

  log("Got threads");

  res.json({ threads: threadsAndReplies, moreAvaliable: more });
};

export default PKThreadsAPI;
