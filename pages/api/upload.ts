import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import fsp from "fs/promises";
import fs from "fs";
// import hasha from "hasha";
import connectDB from "../../middlewares/mongoose";
import { Thread, IThread, IThreadSimple } from "../../schemas/Thread";
import { User } from "./schemas/User";
import { Policy } from "../../policy";
import path from "path";

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

    var fields: Partial<IThreadSimple> = {};

    busboy.on("field", (fieldname: keyof IThreadSimple, value) => {
      console.log("FIELD", fieldname, value);
      fields[fieldname] = value;
    });

    busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
      console.log("FILE", fieldname, filename);

      await fsp.mkdir(path.join(process.cwd(), "embeds"), {
        recursive: true,
      });
      let outfilename = path.join(process.cwd(), "embeds", filename);
      let outstream = fs.createWriteStream(outfilename);

      file.on("limit", () => {
        file.unpipe(outstream);
        outstream.close();
        fs.unlinkSync(outfilename);
      });

      let size = 0;

      file.on("data", (chunk) => (size += chunk.length));

      file.on("end", () => {
        fields["embeds"]?.push({
          algorithm: Policy.hash_algo,
          hash: filename,
          mimetype,
          size: `${size}`,
        });
      });

      file.pipe(outstream);
    });

    busboy.on("finish", () => {
      console.log("Busboy finished");

      Thread.create(fields).then((thread) => {
        res.redirect(`/p/${thread.hash.value}`);
      });
    });

    req.pipe(busboy);
  } else {
    res.writeHead(405);
    res.end("Method not allowed");
  }
};
