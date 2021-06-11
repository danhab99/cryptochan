import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import fsp from "fs/promises";
import fs from "fs";
import * as openpgp from "openpgp";
import connectDB from "../../middlewares/mongoose";
import { Thread, IThreadSimple } from "../../schemas/Thread";
import { Policy } from "../../policy";
import { PublicKey } from "../../schemas/PublicKey";
import { VerifyThread } from "../../crypto";
import _ from "lodash";
import { evalFilename } from "./evalFilename";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();

  if (req.method === "POST") {
    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: Policy.maxSize,
      },
    });

    var thread: IThreadSimple;

    busboy.on("field", (fieldname, value) => {
      console.log("FIELD", fieldname, value);
      if (fieldname === "thread") {
        thread = JSON.parse(value);
      }
    });

    busboy.on(
      "file",
      async (fieldname, file, filename, _encoding, _mimetype) => {
        console.log("FILE", fieldname, filename);

        await fsp.mkdir(evalFilename(""), {
          recursive: true,
        });
        let outfilename = evalFilename(filename);
        let outstream = fs.createWriteStream(outfilename);

        file.on("limit", () => {
          file.unpipe(outstream);
          outstream.close();
          fs.unlinkSync(outfilename);
        });

        file.pipe(outstream);
      }
    );

    busboy.on("finish", async () => {
      console.log("Busboy finished");

      if (thread.body.content.length > Policy.maxLength) {
        res.status(413).json(new Error("Body too long"));
        return;
      }

      const sig = await openpgp.readSignature({
        armoredSignature: thread.signature,
      });

      let issuer: string = sig.getIssuerIDs()[0].toHex();

      let dbPublicKey = await PublicKey.findOne({ keyid: issuer });

      if (dbPublicKey === null) {
        res.writeHead(404).end("Public key not found");
      } else {
        try {
          let verify = await VerifyThread(dbPublicKey.key, sig, thread);

          let valids = await Promise.all(
            verify.signatures
              .filter((x) => x.keyID?.toHex?.() === issuer)
              .map((x) => x.verified)
          );

          if (valids.every((x) => x)) {
            Thread.create(thread).then((thread) => {
              res.redirect(`/t/${thread.hash.value}`);
            });
          } else {
            res
              .status(401)
              .json(new Error("One or more issuers were not verifiable"));
          }
        } catch (e) {
          console.error(e);
          res.writeHead(401).json(e);
          return;
        }
      }
    });

    req.pipe(busboy);
  } else {
    res.writeHead(405);
    res.end("Method not allowed");
  }
};
