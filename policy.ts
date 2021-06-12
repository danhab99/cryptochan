import { IPolicy } from "./IPolicy";

if (!process.env.POLICY) {
  console.error(
    "Please run yarn env to generate policy variable and place it in the POLICY= line in your .env"
  );
  process.exit(1);
}

export const Policy: IPolicy = JSON.parse(process.env.POLICY as string);
