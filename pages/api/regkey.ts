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

  let armoredKey: string;

  busboy.on("field", (fieldname: string, val: string) => {
    if (fieldname === "publickey") {
      armoredKey = val;
    }
  });

  busboy.on("finish", () => {
    if (armoredKey.length) {
      openpgp
        .readKey({
          armoredKey,
        })
        .then((key) => {
          return key.getPrimaryUser().then((user) => ({ key, user }));
        })
        .then(({ key, user }) => {
          let uid = user.user.userID;

          PublicKey.create({
            key: armoredKey,
            fingerprint: key.getFingerprint(),
            keyid: key.getKeyID().toHex(),
            owner: {
              name: uid?.name,
              email: uid?.email,
              userID: uid?.userID,
              comment: uid?.comment,
            },
          }).then(() => {
            res.status(201).send("added public key");
          });
        });
    } else {
      res.status(400).send("field 'publickey' required");
    }
  });

  req.pipe(busboy);
};
