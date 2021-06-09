import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import fsp from "fs/promises";
import fs from "fs";
import * as openpgp from "openpgp";
import connectDB from "../../middlewares/mongoose";
import { Thread, IThreadSimple } from "../../schemas/Thread";
import { Policy } from "../../policy";
import path from "path";
import { PublicKey } from "../../schemas/PublicKey";
import { VerifyThread } from "../../crypto";
import _ from "lodash";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const evalFilename = (filename: string) =>
  path.join(process.cwd(), "embeds", filename);

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

      debugger;

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
          console.warn(verify);
        } catch (e) {
          console.error(e);
        }
        debugger;
      }

      Thread.create(thread).then((thread) => {
        res.redirect(`/p/${thread.hash.value}`);
      });
    });

    req.pipe(busboy);
  } else {
    res.writeHead(405);
    res.end("Method not allowed");
  }
};
