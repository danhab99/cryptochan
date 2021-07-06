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
import LoggingFactory from "../../middlewares/logging";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const UploadAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  openpgp.config.ignoreTime = true;
  const log = LoggingFactory(req, res, "Upload Thread");
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
      log("Busboy field", fieldname, value);
      console.log("FIELD", fieldname, value);
      if (fieldname === "thread") {
        thread = JSON.parse(value);
      }
    });

    busboy.on(
      "file",
      async (fieldname, file, filename, _encoding, mimetype) => {
        log("Busboy file", fieldname, filename, mimetype);

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
      debugger;
      log("Busboy finished");

      if (thread.body.content.length > Policy.maxLength) {
        log("Body too long", thread.body.content.length);
        res.status(413).send("Body too long");
        return;
      }

      if (thread.parenthash) {
        let exists = await Thread.exists({
          "hash.value": thread.parenthash,
          approved: true,
          replies: true
        });

        if (!exists) {
          log("Thread replying to non existing or banned thread", thread.parenthash);
          res
            .status(406)
            .json(
              new Error("Thread is replying to a thread that doesn't exist")
            );
          return;
        }
      }

      if (Policy.publickey.require && !thread.signature) {
        log("Thread is not signed");
        res.status(401).send("Signature required");
        return;
      }

      if (!Policy.categories.map((x) => x.name).includes(thread.category)) {
        log("Thread is in unknown category", thread.category);
        res.status(406).send("Unknown category");
        return;
      }

      const sig = await openpgp.readSignature({
        armoredSignature: thread.signature,
      });
      let issuer: string = sig.getSigningKeyIDs()[0].toHex();
      let dbPublicKey = await PublicKey.findOne({ keyid: issuer });

      if (dbPublicKey === null) {
        log("Unknow signing public key", issuer, thread.signature);
        res.status(404).send("Public key not found");
        return;
      }

      if (dbPublicKey.revoked) {
        log("Public key revoked");
        res.status(401).send("Public key has been revoked by certificate");
        return;
      }

      if (Policy.publickey.preapproved && !dbPublicKey.approved) {
        log("Public key not approved");
        res.status(401).send("Public key not approved");
        return;
      }

      try {
        if (await VerifyThread(dbPublicKey.key, sig, thread)) {
          log("Good signature");
          Thread.create({
            ...thread,
            approved: dbPublicKey.clearance.always_approved,
          }).then((thread) => {
            res.status(201).end(thread.hash.value);
          });
        } else {
          log("Bad signature");
          res.status(401).send("One or more issuers were not verifiable");
        }
      } catch (e) {
        log("Error", e);
        console.error(e);
        res.writeHead(401).json(e);
        return;
      }
    });

    req.pipe(busboy);
  } else {
    log("Method not allowed");
    res.writeHead(405);
    res.end("Method not allowed");
  }
};

export default UploadAPI;
