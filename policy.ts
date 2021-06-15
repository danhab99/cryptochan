import { IPolicy } from "./IPolicy";

if (typeof process.env.NEXT_PUBLIC_POLICY === "undefined") {
  console.error(
    "Please run yarn env to generate policy variable and place it in the POLICY= line in your .env",
    process.env
  );
  process.exit(1);
}

export const Policy: IPolicy = JSON.parse(
  process.env.NEXT_PUBLIC_POLICY as string
);
