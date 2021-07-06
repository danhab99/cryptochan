import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middlewares/mongoose";
import LoggingFactory from "../../../middlewares/logging";
import encryptForMasters from "../../../query/encryptForMasters"

const AdminTestAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  const log = LoggingFactory(req, res, "Admin test");
  await connectDB();

  if (req.method?.toLowerCase() === "get") {
    log("Sending test payload");
    res.send(await encryptForMasters({success: true, date: Date.now}))

  } else {
    res.status(406).send("Method not allowed");
  }
};

export default AdminTestAPI;
