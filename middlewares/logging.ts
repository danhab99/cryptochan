import { IncomingMessage, OutgoingMessage } from "http";
import { NextApiRequest, NextApiResponse } from "next";

export default function LoggingFactory(
  req: NextApiRequest | IncomingMessage,
  _res: NextApiResponse | OutgoingMessage,
  mod: string
) {
  return (msg: string, ...args: any[]) => {
    console.log(
      `${new Date().toISOString()} ${req.socket.remoteAddress} | ${
        req.method
      } ${req.url}: [${mod}] ${msg}`,
      ...args
    );
  };
}
