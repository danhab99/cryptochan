import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import { getThreadsAndReplies } from "../../../query/getThreadsAndReplies";
import { sanatizeParams } from "../../../sanatizeQuery";
import LoggingFactory from "../../../middlewares/logging";

const CategoryAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "Category threads");
  await connectDB();
  const cat = sanatizeParams(req.query.cat);

  log("Getting threads for category", cat, req.query.page);

  if (!cat) {
    log("Unknown category", cat);
    res.status(406).send("Unknow category");
    return;
  }

  const { threadsAndReplies, more } = await getThreadsAndReplies(
    { type: "category", category: cat },
    {
      page: parseInt(req.query.page as string) || 0,
    }
  );

  log("Got threads");

  res.json({ threads: threadsAndReplies, moreAvaliable: more });
};

export default CategoryAPI;
