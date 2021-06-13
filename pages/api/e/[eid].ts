import { NextApiRequest, NextApiResponse } from "next";
import { minioClient } from "../../../middlewares/minio";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!req.query.eid) {
    res.status(400).json(new Error("Embed hash required"));
    return;
  }

  minioClient.statObject(
    (process.env.S3_PREFIX as string) + "-embeds",
    req.query.eid as string,
    (err, stat) => {
      if (err) {
        res.status(500).json(err);
      } else {
        minioClient.presignedGetObject(
          (process.env.S3_PREFIX as string) + "-embeds",
          req.query.eid as string,
          604799,
          {
            "response-cache-control": "public, max-age=604800, immutable",
            "response-content-type": stat.metaData.mimetype,
          },
          (err, url) => {
            if (err) {
              res.status(500).json(err);
            } else {
              res.setHeader(
                "Cache-Control",
                "public, max-age=604800, immutable"
              );
              res.redirect(url);
            }
          }
        );
      }
    }
  );
};
