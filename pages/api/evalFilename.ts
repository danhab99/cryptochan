import path from "path";

export const evalFilename = (filename: string) =>
  path.join(process.cwd(), "embeds", filename);
