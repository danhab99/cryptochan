import * as openpgp from "openpgp";
import { encode } from "base64-arraybuffer";
import str2ab from "string-to-arraybuffer";
import { IThreadSimple, IEmbed } from "./schemas/Thread";
import { Policy } from "./policy";

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

export type ThreadWithEmbeds = {
  embeds: Array<{ bits: ArrayBuffer } & IEmbed>;
} & IThreadSimple;

export type PartialThreadWithEmbeds = Partial<ThreadWithEmbeds>;

const ArrayToArrayBuffer = (data: Array<any>): ArrayBuffer => {
  return data
    .map(
      (x: string | ArrayBuffer): ArrayBuffer =>
        x instanceof ArrayBuffer ? x : str2ab(x)
    )
    .reduce((acc, curr) => appendBuffer(acc, curr), new ArrayBuffer(0));
};

const HashThread = async (entry: PartialThreadWithEmbeds) => {
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
  let hashedSeries = ([] as Array<any>).concat([hash], hashingSeries);

  return { hashedSeries, hash };
};

export interface ThreadSignature {
  hash: string;
  signature: string;
}

export const SignThread = async (
  armoredKey: string,
  passphrase: string,
  entry: PartialThreadWithEmbeds
): Promise<ThreadSignature> => {
  let { hashedSeries, hash } = await HashThread(entry);

  let signingBuffer = ArrayToArrayBuffer(hashedSeries);

  let unsignedMessage = openpgp.createMessage({
    text: encode(signingBuffer),
  });

  const privateKey = openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey }),
    passphrase,
  });

  let signature = await openpgp.sign({
    message: await unsignedMessage, // CleartextMessage or Message object
    signingKeys: await privateKey, // for signing
    detached: true,
  });

  return { hash, signature };
};

export const VerifyThread = async (
  armoredKey: string,
  signature: string | openpgp.Signature,
  entry: PartialThreadWithEmbeds
) => {
  let publicKey = openpgp.readKey({
    armoredKey: armoredKey,
  });

  let parsedSig: openpgp.Signature;

  if (signature instanceof openpgp.Signature) {
    parsedSig = signature;
  } else {
    parsedSig = await openpgp.readSignature({ armoredSignature: signature });
  }

  let { hashedSeries } = await HashThread(entry);

  let testMessage = await openpgp.createMessage({
    text: encode(ArrayToArrayBuffer(hashedSeries)),
  });

  return openpgp.verify({
    verificationKeys: [await publicKey],
    signature: parsedSig,
    expectSigned: true,
    message: testMessage,
  });
};
