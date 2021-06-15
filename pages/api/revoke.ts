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
      fields: 1,
    },
  });

  var publicKeyArmored: string;

  busboy.on("field", (fieldname: string, val: string) => {
    if (fieldname === "publickey") {
      publicKeyArmored = val;
    }
  });

  busboy.on("finish", async () => {
    if (publicKeyArmored.length > 0) {
      let rev = await openpgp.readKey({
        armoredKey: publicKeyArmored,
      });

      if (rev.revocationSignatures.length) {
        await PublicKey.findOneAndUpdate(
          { keyid: rev.getKeyID().toHex() },
          {
            key: publicKeyArmored,
            revoked: true,
            approved: false,
          },
          {
            upsert: true,
            new: true,
          }
        );

        res.status(200).send("Public key successfully revoked");
      } else {
        res.status(400).send("Public key is not revoked");
      }
    } else {
      res.status(400).send("field 'publickey' required");
    }
  });

  req.pipe(busboy);
};
