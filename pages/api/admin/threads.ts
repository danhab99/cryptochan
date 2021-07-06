import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import LoggingFactory from "../../../middlewares/logging";
import encryptForMasters from "../../../query/encryptForMasters";
import { Thread } from "../../../schemas/Thread";
import { sanatizeDB, sanatizeParams } from "../../../sanatizeQuery";
import * as openpgp from "openpgp";
import { IPublicKey, PublicKey } from "../../../schemas/PublicKey";

const PAGE_COUNT = 12;

const AdminThreadAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "Admin threads");
  await connectDB();

  switch (req.method?.toLowerCase()) {
    case "get": {
      let page = parseInt(sanatizeParams(req.query.page, "0"));
      log("Getting threads", page);
      let t = await sanatizeDB(
        Thread.find({})
          .skip(page * PAGE_COUNT)
          .limit(PAGE_COUNT)
      );
      let e = await encryptForMasters(t);
      return res.send(e);
    }

    case "post": {
      log("Updating thread");
      let mks = await PublicKey.find({ "clearance.master": true });
      if (mks) {
        let verify = await openpgp.verify({
          message: await openpgp.readCleartextMessage({
            cleartextMessage: req.body as string,
          }),
          verificationKeys: await Promise.all(
            mks.map((mk: IPublicKey) => openpgp.readKey({ armoredKey: mk.key }))
          ),
        });

        let verifications = await Promise.all(
          verify.signatures.map((x) => x.verified)
        );

        log("Verification", verifications);

        if (verifications.some((x) => x)) {
          let payload = JSON.parse(verify.data as string);
          log("Good verification", payload);

          switch (payload.action) {
            case "approve":
              log("Approving thread");
              await Thread.updateOne(
                { "hash.value": payload.hash },
                { approved: payload.approved }
              );
              res.status(201).send("Updated");
              break;

            case "replies":
              log("Setting replies");
              await Thread.updateOne(
                { "hash.value": payload.hash },
                { replies: payload.replies }
              );
              res.status(201).send("Updated");
              break;

            default:
              log("Unknown directive");
              res.status(402).send("Unknown directive");
          }
        } else {
          log("Bad signatures")
          res.status(401).send("Unauthorized signature")
        }
      }
      break;
    }

    default:
      res.status(406).send("Method not allowed");
  }
};

export default AdminThreadAPI;
