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
      fields: 2,
    },
  });

  let newkeyArmored: string;
  let sigArmored: string;

  busboy.on("field", (fieldname: string, val: string) => {
    if (fieldname === "newkey") {
      newkeyArmored = val;
    } else if (fieldname == "signature") {
      sigArmored = val;
    }
  });

  busboy.on("finish", async () => {
    debugger;
    if (newkeyArmored) {
      let ok: boolean | string = false;

      if (sigArmored) {
        let sig = await openpgp.readSignature({
          armoredSignature: sigArmored,
        });

        let signers = sig.getSigningKeyIDs().map((x) => x.toHex());

        let dbpks = await PublicKey.find({
          keyid: { $in: signers },
          approved: true,
        });

        let pks = await Promise.all(
          dbpks.map((pk) =>
            openpgp.readKey({
              armoredKey: pk.key,
            })
          )
        );

        let v = await openpgp.verify({
          message: await openpgp.createMessage({ text: newkeyArmored }),
          verificationKeys: pks,
          signature: sig,
        });

        let verified = await Promise.all(v.signatures.map((x) => x.verified));

        if (verified.some((x) => x)) {
          ok = v.signatures[verified.findIndex((x) => x)].keyID.toHex();
        }
      }

      let npk = await openpgp.readKey({
        armoredKey: newkeyArmored,
      });

      let owner = (await npk.getPrimaryUser()).user.userID;
      try {
        let completedKey = await PublicKey.create({
          key: newkeyArmored,
          fingerprint: npk.getFingerprint(),
          keyid: npk.getKeyID().toHex(),
          owner: {
            name: owner?.name,
            email: owner?.email,
            userID: owner?.userID,
            comment: owner?.comment,
          },
          approved: ok ? true : false,
          signingKey: sigArmored,
          signingKeyID: ok as string,
        });

        if (completedKey) {
          res.status(201).end("Created");
        }
      } catch (e) {
        res.status(400).json(e);
      }
    }
  });

  req.pipe(busboy);
};
