import { ListObjectsV2Command } from "@aws-sdk/client-s3";

import { r2 } from "../lib/r2";
import { env } from "../config/env";

export const testR2 = async () => {
  const result = await r2.send(
    new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME,
    })
  );

  console.log(result);
};
