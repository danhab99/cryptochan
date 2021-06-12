import * as Minio from "minio";
import _ from "lodash";

if (
  !["S3_ENDPOINT", "S3_ACCESS", "S3_SECRET", "S3_PREFIX"].every((p) =>
    _.has(process.env, p)
  )
) {
  console.error("Missing S3 configs");
  process.exit(1);
}

export const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT as string,
  port: parseInt(process.env.S3_PORT || "443"),
  useSSL: true,
  accessKey: process.env.S3_ACCESS as string,
  secretKey: process.env.S3_SECRET as string,
});

const checkBucket = (name: string) =>
  minioClient
    .bucketExists(process.env.S3_PREFIX + "-" + name)
    .then((exists) => {
      if (!exists) {
        minioClient.makeBucket(process.env.S3_PREFIX + "-" + name, "here");
      }
    })
    .catch((e) => {
      console.error("MINIO INIT ERROR", e);
      process.exit(1);
    });

checkBucket("embeds");
