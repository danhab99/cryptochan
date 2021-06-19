import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import * as openpgp from "openpgp";
import connectDB from "../../middlewares/mongoose";
import { PublicKey } from "../../schemas/PublicKey";
import LoggingFactory from "../../middlewares/logging";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const RegkeyAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  openpgp.config.ignoreTime = true;
  const log = LoggingFactory(req, res, "RegKey");
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
    log("Busboy field", fieldname, val);
    if (fieldname === "newkey") {
      newkeyArmored = val;
    } else if (fieldname == "signature") {
      sigArmored = val;
    }
  });

  busboy.on("finish", async () => {
    log("Busboy finished");
    debugger;
    if (newkeyArmored) {
      let ok: boolean | string = false;

      if (sigArmored) {
        let sig = await openpgp.readSignature({
          armoredSignature: sigArmored,
        });

        let signers = sig.getSigningKeyIDs().map((x) => x.toHex());

        log("Signature included", signers);

        let dbpks = await PublicKey.find({
          keyid: { $in: signers },
          approved: true,
        });

        log(
          "Found public keys",
          dbpks.map((x) => x.keyid)
        );

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
          log("Signature verified", ok);
        } else {
          log("Invalid signature, ignoring");
        }
      }

      let npk = await openpgp.readKey({
        armoredKey: newkeyArmored,
      });

      let owner = (await npk.getPrimaryUser()).user.userID;
      log("Retrieved public key", owner);
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
          log("Completed key", completedKey);
          res.status(201).end("Created");
        }
      } catch (e) {
        log("Error", e);
        res.status(400).json(e);
      }
    }
  });

  req.pipe(busboy);
};

export default RegkeyAPI;
