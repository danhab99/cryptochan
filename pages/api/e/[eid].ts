import { NextApiRequest, NextApiResponse } from "next";
import { evalFilename } from "../evalFilename";
import { minioClient } from "../../../middlewares/minio";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let p = evalFilename(req.query.eid as string);

  if (!req.query.eid) {
    res.status(400).json(new Error("Embed hash required"));
    return;
  }

  minioClient.presignedGetObject(
    (process.env.S3_PREFIX as string) + "-embeds",
    req.query.eid as string,
    30,
    {
      "Cache-Control": "public, max-age=604800, immutable",
    },
    (err, url) => {
      console.log(err, url);
      if (err) {
        res.status(500).json(err);
      } else {
        res.redirect(url);
      }
    }
  );
};
