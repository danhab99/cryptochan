import { NextApiRequest, NextApiResponse } from "next";
import immutable from "../../../middlewares/immutable";
import { minioClient } from "../../../middlewares/minio";
import LoggingFactory from "../../../middlewares/logging";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise<void>(async (resolve) => {
    const log = LoggingFactory(req, res, "Embed");
    immutable(req, res);
    if (!req.query.eid) {
      res.status(400).json(new Error("Embed hash required"));
      return;
    }

    log("Getting embed");

    minioClient.statObject(
      (process.env.S3_PREFIX as string) + "-embeds",
      req.query.eid as string,
      (err, stat) => {
        if (err) {
          log("Unable to stat embed", err);
          res.status(500).send(err.message);
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
                log("Unable to get presigned url", err);
                res.status(500).send(err.message);
              } else {
                log("Redirecting to", url);
                res.redirect(url);
              }
            }
          );
        }
      }
    );

    resolve();
  });
};
