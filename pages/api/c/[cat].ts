import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import { getThreadsAndReplies } from "../../../query/getThreadsAndReplies";
import { sanatizeParams } from "../../../sanatizeQuery";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  const cat = sanatizeParams(req.query.cat);

  if (!cat) {
    res.status(406).json(new Error("Unknow category"));
    return;
  }

  const { threadsAndReplies, more } = await getThreadsAndReplies(
    { type: "category", category: cat },
    {
      page: parseInt(req.query.page as string) || 0,
    }
  );

  res.json({ threads: threadsAndReplies, moreAvaliable: more });
};
