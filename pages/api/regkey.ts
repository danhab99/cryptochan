import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import * as openpgp from "openpgp";
import connectDB from "../../middlewares/mongoose";
import { PublicKey } from "../../schemas/PublicKey";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  let busboy = new Busboy({
    headers: req.headers,
    limits: {
      fileSize: 0,
      fields: 12,
    },
  });

  let newkeys: string[] = [];

  busboy.on("field", (fieldname: string, val: string) => {
    if (fieldname === "newkey") {
      newkeys.push(val);
    }
  });

  busboy.on("finish", async () => {
    await Promise.all(newkeys.map((newkey) => {}));
  });

  req.pipe(busboy);
};
