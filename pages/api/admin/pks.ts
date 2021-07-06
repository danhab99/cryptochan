import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import LoggingFactory from "../../../middlewares/logging";
import encryptForMasters from "../../../query/encryptForMasters";
import { PublicKey } from "../../../schemas/PublicKey";
import { sanatizeDB, sanatizeParams } from "../../../sanatizeQuery";
import verifyMaster from "../../../query/verifyMaster";

const PAGE_COUNT = 12;

const AdminPublicKeyAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "Admin pks");
  await connectDB();

  switch (req.method?.toLowerCase()) {
    case "get": {
      let page = parseInt(sanatizeParams(req.query.page, "0"));
      log("Getting public keys", page);
      let pks = await sanatizeDB(
        PublicKey.find({})
          .skip(page * PAGE_COUNT)
          .limit(PAGE_COUNT)
      );
      let e = await encryptForMasters(pks);
      return res.send(e);
    }
    case "post": {
      let verifiedBody = await verifyMaster(req.body);
      if (verifiedBody)
      {
        let directive = JSON.parse(verifiedBody as string);

        await PublicKey.updateOne(
          { keyid: directive?.pkid },
          { approved: directive?.approved }
        );

        return res.status(201).send("Updated");
      }
    }
  }
};

export default AdminPublicKeyAPI;
