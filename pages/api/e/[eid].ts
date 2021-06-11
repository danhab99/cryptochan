import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { evalFilename } from "../evalFilename";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let p = evalFilename(req.query.eid as string);

  if (fs.existsSync(p)) {
    try {
      res.writeHead(200, {
        "Cache-Control": "public, max-age=604800, immutable",
      });
      let read = fs.createReadStream(p);
      read.pipe(res);
    } catch (e) {
      res.status(500).json(e);
    }
  } else {
    res.status(404).json(new Error("Not found"));
  }
};
