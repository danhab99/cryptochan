import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import Busboy from "busboy";
import connectDB from "../../middlewares/mongoose";
import { Entry } from "../../schemas/Entry";
import { User } from "../../schemas/User";
import { GetPolicy } from "../../policy";

const Policy = GetPolicy();

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  debugger;
  await connectDB();

  if (req.method === "POST") {
    const busboy = new Busboy({ headers: req.headers });
    // TODO Catch the incoming form https://www.npmjs.com/package/busboy

    req.pipe(busboy);
  } else {
    res.writeHead(405);
    res.end("Method not allowed");
  }
};
