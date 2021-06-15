import { NextApiRequest, NextApiResponse } from "next";
import immutable from "../../middlewares/immutable";
import { Policy } from "../../policy";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  immutable(req, res);
  res.json(Policy);
};
