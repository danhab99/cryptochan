import { NextApiRequest, NextApiResponse } from "next";
import immutable from "../../middlewares/immutable";
import { Policy } from "../../policy";
import LoggingFactory from "../../middlewares/logging";

const PolicyAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "Policy");
  log("Retrieving policy");
  immutable(req, res);
  res.json(Policy);
};

export default PolicyAPI;
