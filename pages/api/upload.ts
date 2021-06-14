import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import * as openpgp from "openpgp";
import connectDB from "../../middlewares/mongoose";
import { Thread, IThreadSimple } from "../../schemas/Thread";
import { Policy } from "../../policy";
import { PublicKey } from "../../schemas/PublicKey";
import { VerifyThread } from "../../crypto";
import _ from "lodash";
import { minioClient } from "../../middlewares/minio";
import { Readable } from "stream";

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
      async (fieldname, file, filename, _encoding, mimetype) => {
        console.log("FILE", fieldname, filename);

        minioClient
          .putObject(
            (process.env.S3_PREFIX as string) + "-embeds",
            filename,
            file as Readable,
            { mimetype }
          )
          .then((e) => console.log(e));
      }
    );

    busboy.on("finish", async () => {
      console.log("Busboy finished");

      if (thread.body.content.length > Policy.maxLength) {
        res.status(413).json(new Error("Body too long"));
        return;
      }

      if (thread.parenthash) {
        let exists = await Thread.exists({
          "hash.value": thread.parenthash,
          approved: true,
        });

        if (!exists) {
          res
            .status(406)
            .json(
              new Error("Thread is replying to a thread that doesn't exist")
            );
          return;
        }
      }

      if (Policy.publickey.require && !thread.signature) {
        res.status(401).json(new Error("Signature required"));
        return;
      }

      if (!Policy.categories.map((x) => x.name).includes(thread.category)) {
        res.status(406).json(new Error("Unknown category"));
        return;
      }

      const sig = await openpgp.readSignature({
        armoredSignature: thread.signature,
      });
      let issuer: string = sig.getSigningKeyIDs()[0].toHex();
      let dbPublicKey = await PublicKey.findOne({ keyid: issuer });

      if (dbPublicKey === null) {
        res.status(404).json(new Error("Public key not found"));
        return;
      }

      if (dbPublicKey.revokeCert) {
        res
          .status(401)
          .json(new Error("Public key has been revoked by certificate"));
      }

      if (Policy.publickey.preapproved && !dbPublicKey.approved) {
        res.status(401).json(new Error("Public key not approved"));
        return;
      }

      try {
        if (await VerifyThread(dbPublicKey.key, sig, thread)) {
          Thread.create(thread).then((thread) => {
            res.status(201).end(thread.hash.value);
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
    });

    req.pipe(busboy);
  } else {
    res.writeHead(405);
    res.end("Method not allowed");
  }
};
