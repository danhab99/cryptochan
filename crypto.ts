import * as openpgp from "openpgp";
import { encode } from "base64-arraybuffer";
import str2ab from "string-to-arraybuffer";
import { IEntrySimple, IEmbed } from "./schemas/Entry";
import { GetPolicy } from "./policy";

const Policy = GetPolicy();

const appendBuffer = (left: ArrayBuffer, right: ArrayBuffer): ArrayBuffer => {
  var t = new Uint8Array(left.byteLength + right.byteLength);
  t.set(new Uint8Array(left), 0);
  t.set(new Uint8Array(right), left.byteLength);
  return t.buffer;
};

export const HashArrayBuffer = (data: ArrayBuffer): Promise<string> =>
  crypto.subtle
    .digest(Policy.hash_algo, data)
    .then((hash) =>
      [...new Uint8Array(hash)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );

export type EntryWithEmbeds = {
  embeds: Array<{ bits: ArrayBuffer } & IEmbed>;
} & IEntrySimple;

const ArrayToArrayBuffer = (data: Array<any>): ArrayBuffer => {
  return data
    .map(
      (x: string | ArrayBuffer): ArrayBuffer =>
        x instanceof ArrayBuffer ? x : str2ab(x)
    )
    .reduce((acc, curr) => appendBuffer(acc, curr), new ArrayBuffer(0));
};

export interface EntrySignature {
  hash: string;
  signature: string;
}

export const SignEntry = async (
  armoredKey: string,
  passphrase: string,
  entry: Partial<EntryWithEmbeds>
): Promise<EntrySignature> => {
  let hashingSeries: Array<any> = [
    entry?.author?.name,
    entry?.author?.publickey,
    entry?.body?.content,
    entry?.body?.mimetype,
    entry?.category,
    entry?.parenthash,
    entry?.published?.toISOString(),
    entry?.tag?.join(""),
    ...(entry.embeds || []).reduce(
      (acc, e) => [...acc, e.hash, e.algorithm, e.mimetype, e.size, e.bits],
      [] as any[]
    ),
  ];

  let hashingBuffer = ArrayToArrayBuffer(hashingSeries);

  let hash = await HashArrayBuffer(hashingBuffer);

  let signingBuffer = ArrayToArrayBuffer(
    ([] as Array<any>).concat([hash], hashingSeries)
  );

  let unsignedMessage = await openpgp.createMessage({
    text: encode(signingBuffer),
  });

  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readKey({ armoredKey }),
    passphrase,
  });

  let signature = await openpgp.sign({
    message: unsignedMessage, // CleartextMessage or Message object
    signingKeys: privateKey, // for signing
    detached: true,
  });

  return { hash, signature };
};
