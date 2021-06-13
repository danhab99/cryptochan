import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import openpgp from "openpgp";
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
  var revocationCertificateArmored: string;

  busboy.on("field", (fieldname: string, val: string) => {
    if (fieldname === "publickey") {
      publicKeyArmored = val;
    } else if (fieldname === "revocationcert") {
      revocationCertificateArmored = val;
    }
  });

  busboy.on("finish", async () => {
    if (
      publicKeyArmored.length > 0 &&
      revocationCertificateArmored.length > 0
    ) {
      let pk = await openpgp.readKey({ armoredKey: publicKeyArmored });

      let dbpk = await PublicKey.findOne({ keyid: pk.getKeyID().toHex() });

      if (!dbpk) {
        res.status(401).json(new Error("Unknown public key"));
        return;
      }

      let rpk = await openpgp.revokeKey({
        key: pk,
        revocationCertificate: revocationCertificateArmored,
      });

      dbpk.revokeCert = rpk.armor();
      await dbpk.save();

      res.status(200).send("Public key successfullyt revoked");
    } else {
      res.status(400).send("field 'publickey' required");
    }
  });

  req.pipe(busboy);
};
