import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import LoggingFactory from "../../../middlewares/logging";
import encryptForMasters from "../../../query/encryptForMasters";
import { Thread } from "../../../schemas/Thread";
import { sanatizeDB, sanatizeParams } from "../../../sanatizeQuery";
import verifyMaster from "../../../query/verifyMaster";

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
          .sort({ published: -1 })
          .skip(page * PAGE_COUNT)
          .limit(PAGE_COUNT)
      );
      let e = await encryptForMasters(t);
      return res.send(e);
    }

    case "post": {
      log("Updating thread");
      let verifiedBody = await verifyMaster(req.body);
      if (verifiedBody) {
        let payload = JSON.parse(verifiedBody as string);
        log("Good verification", payload);

        if (payload.action && payload.hash) {
          let update = async (content: any) => {
            await Thread.updateOne({ "hash.value": payload.hash }, content);
            return res.status(201).send("Updated");
          };

          switch (payload.action) {
            case "approve":
              log("Approving thread");
              return update({ approved: payload.approved });

            case "replies":
              log("Setting replies");
              return update({ replies: payload.replies });

            default:
              log("Unknown directive");
              return res.status(402).send("Unknown directive");
          }
        } else {
          log("Bad format", payload);
          return res.status(400).send("Bad format");
        }
      } else {
        log("Bad signatures");
        return res.status(401).send("Unauthorized signature");
      }
    }

    default:
      return res.status(406).send("Method not allowed");
  }
};

export default AdminThreadAPI;
