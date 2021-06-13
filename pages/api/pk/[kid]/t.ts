import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../../middlewares/mongoose";
import { getThreadsAndReplies } from "../../../../query/getThreadsAndReplies";
import { sanatizeDB, sanatizeParams } from "../../../../sanatizeQuery";
import { Thread } from "../../../../schemas/Thread";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const page = parseInt(sanatizeParams(req.query.page, "0"));
  const pk = sanatizeParams(req.query.kid);

  if (!pk) {
    res.status(406).json(new Error("Unknow key"));
    return;
  }

  const { threadsAndReplies, more } = await getThreadsAndReplies(
    { type: "publickey", pk },
    { page }
  );

  res.json({ threads: threadsAndReplies, moreAvaliable: more });
};
