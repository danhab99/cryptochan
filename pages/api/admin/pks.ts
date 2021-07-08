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
      log("Updating public key", req.body);
      let verifiedBody = await verifyMaster(req.body);
      if (verifiedBody) {
        let payload = JSON.parse(verifiedBody as string);

        switch (payload.action) {
          case "approve":
            log("Approving public key");
            await PublicKey.updateOne(
              { keyid: payload?.keyid },
              { approved: payload?.approve }
            );
            return res.status(201).send("Updated");

          case "always approve":
            log("Clearing public key for always approved");
            await PublicKey.updateOne(
              { keyid: payload?.keyid },
              { "clearance.always_approved": payload?.approve }
            );
            return res.status(201).send("Updated");

          case "master":
            log("Setting public key as master");
            await PublicKey.updateOne(
              { keyid: payload?.keyid },
              { "clearance.master": payload?.master }
            );
            return res.status(201).send("Updated");

          default:
            log("Unknown directive");
            return res.status(402).send("Unknown directive");
        }
      } else {
        return res.status(401).send("Unauthorized");
      }
    }
  }
};

export default AdminPublicKeyAPI;
