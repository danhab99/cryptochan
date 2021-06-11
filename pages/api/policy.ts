import { NextApiRequest, NextApiResponse } from "next";
import { Policy } from "../../policy";

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  res.json(Policy);
};
