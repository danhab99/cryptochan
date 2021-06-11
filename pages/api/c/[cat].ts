import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import { getThreadsInCategory } from "../../../query/getThreadsInCategory";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  console.log(req.query);

  if (!req.query.cat) {
    res.status(406).json(new Error("Unknow category"));
    return;
  }

  const { threadsAndReplies, threads } = await getThreadsInCategory(
    req.query.cat as string,
    {
      page: parseInt(req.query.page as string) || 0,
      sort: "date",
    }
  );

  res.json({ threads: threadsAndReplies, moreAvaliable: threads.length > 0 });
};
