import { NextApiRequest, NextApiResponse } from "next";
import * as openpgp from "openpgp";
import connectDB from "../../../middlewares/mongoose";
import { PublicKey } from "../../../schemas/PublicKey";
import LoggingFactory from "../../../middlewares/logging";

const AdminTestAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "Admin test");
  await connectDB();

  if (req.method?.toLowerCase() === "get") {
    log("Preparing test message");

    let masters = await PublicKey.find({ "clearance.master": true });

    if (!masters) {
      log("No know master keys")
      res.status(500).send("No known master keys")
      return
    }

    let mpks: openpgp.PublicKey[] = await Promise.all<openpgp.PublicKey>(
      masters.map((x) => openpgp.readKey({ armoredKey: x.key }))
    );

    let payload = await openpgp.encrypt({
      message: await openpgp.createMessage({
        text: JSON.stringify({
          success: true,
          date: Date.now(),
        }),
      }),
      encryptionKeys: mpks,
      armor: true,
    });

    log("Encrypted payload");

    res.send(payload);
  } else {
    res.status(406).send("Method not allowed");
  }
};

export default AdminTestAPI;
