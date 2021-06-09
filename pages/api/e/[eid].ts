import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { evalFilename } from "../evalFilename";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let p = evalFilename(req.query.eid as string);

  if (fs.existsSync(p)) {
    res.writeHead(200, {
      "Cache-Control": "public, max-age=604800, immutable",
    });
    let read = fs.createReadStream(p);
    read.pipe(res);
  } else {
    res.writeHead(404).end("Embedded file not found");
  }
};
