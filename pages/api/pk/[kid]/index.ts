import { NextApiRequest, NextApiResponse } from "next";
import immutable from "../../../../middlewares/immutable";
import connectDB from "../../../../middlewares/mongoose";
import { PublicKey } from "../../../../schemas/PublicKey";
import LoggingFactory from "../../../../middlewares/logging";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "PK");
  await connectDB();
  immutable(req, res);

  log("Getting public key", req.query);

  const pk = await PublicKey.findOne({ keyid: req.query.kid as string });

  if (pk) {
    log("Sending public key");
    res.send(pk.key);
  } else {
    log("Public key not found");
    res.status(404).send("Not found");
  }
};
