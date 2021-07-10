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

        if (payload.action && payload.keyid) {
          let update = async (content: any) => {
            await PublicKey.updateOne({ keyid: payload.keyid }, content);
            return res.status(201).send("Updated");
          };

          switch (payload.action) {
            case "approve":
              log("Approving public key");
              return update({ approved: payload?.approve });

            case "always approve":
              log("Clearing public key for always approved");
              return update({ "clearance.always_approved": payload?.approve });

            case "master":
              log("Setting public key as master");
              return update({ "clearance.master": payload?.master });

            default:
              log("Unknown directive");
              return res.status(400).send("Unknown directive");
          }
        } else {
          log("Bad format", payload);
          return res.status(400).send("Bad format");
        }
      } else {
        log("Unauthorized");
        return res.status(403).send("Unauthorized");
      }
    }
  }
};

export default AdminPublicKeyAPI;
