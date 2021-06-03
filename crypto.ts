import * as openpgp from "openpgp";
import { IEntry } from "./schemas/Entry";

const EntryToMessage = (e: IEntry) => {
  let text = [
    e.hash,
    e.author.name,
    e.author.publickey,
    e.body.content,
    e.body.mimetype,
    e.category,
    e.tag.join(""),
    e.embeds.map((x) => [
      x.hash,
      x.mimetype,
      x.size,
      // TODO: Get embed bits in here somehow
    ]),
  ].join("");

  return openpgp.createCleartextMessage({ text });
};

export const SignEntry = async (
  secretKey: openpgp.PrivateKey,
  entry: IEntry
) => {
  let es = await EntryToMessage(entry);

  return await openpgp.sign({
    message: es, // CleartextMessage or Message object
    signingKeys: secretKey, // for signing
  });
};

export const VerifyEntry = async (
  publicKey: openpgp.PublicKey,
  entry: IEntry,
  signature: openpgp.Signature
) => {
  let es = await EntryToMessage(entry);
  return openpgp.verify({
    message: es,
    verificationKeys: publicKey,
    signature,
  });
};
