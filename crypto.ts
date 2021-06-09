import * as openpgp from "openpgp";
import { encode, decode } from "base64-arraybuffer";
import str2ab from "string-to-arraybuffer";
import { IThreadSimple, IEmbed } from "./schemas/Thread";
import { Policy } from "./policy";
import _ from "lodash";
import stringify from "json-stable-stringify";
import * as node_crypto from "crypto";

const appendBuffer = (left: ArrayBuffer, right: ArrayBuffer): ArrayBuffer => {
  var t = new Uint8Array(left.byteLength + right.byteLength);
  t.set(new Uint8Array(left), 0);
  t.set(new Uint8Array(right), left.byteLength);
  return t.buffer;
};

export const HashArrayBuffer = async (data: ArrayBuffer): Promise<string> => {
  let hashab: Promise<ArrayBuffer>;
  if (typeof window === "undefined") {
    console.log("Digesting using node", data);
    let buf = node_crypto
      .createHash(Policy.hash_algo.toLowerCase().replace("-", ""))
      .update(new Uint8Array(data))
      .digest();

    hashab = Promise.resolve(new Uint8Array(buf).buffer);
  } else {
    console.log("Digesting using webcrypto", data);
    hashab = crypto.subtle.digest(Policy.hash_algo, data);
  }

  return [...new Uint8Array(await hashab)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export type ThreadWithEmbeds = {
  embeds: Array<{ bits: ArrayBuffer } & IEmbed>;
} & IThreadSimple;

export type PartialThreadWithEmbeds = Partial<ThreadWithEmbeds>;

const ArrayToArrayBuffer = (data: Array<any>): ArrayBuffer => {
  return _.compact(data)
    .map(
      (x: string | ArrayBuffer): ArrayBuffer =>
        x instanceof ArrayBuffer ? x : str2ab(x)
    )
    .reduce((acc, curr) => appendBuffer(acc, curr), new ArrayBuffer(0));
};

const HashThread = async (entry: Partial<IThreadSimple>) => {
  console.log("Hashing thread", entry);

  const serialized = stringify(entry);

  console.log("Hashing input", serialized);
  debugger;

  let hash = await HashArrayBuffer(decode(serialized));

  console.log("Hash", hash);

  return hash;
};

export interface ThreadSignature {
  hash: string;
  signature: string;
}

export const SignThread = async (
  armoredKey: string,
  passphrase: string,
  entry: Partial<IThreadSimple>
): Promise<ThreadSignature> => {
  console.log("Signing Thread", armoredKey, entry);
  let hash = await HashThread(entry);

  let unsignedMessage = openpgp.createMessage({
    text: hash,
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

  console.log("Signature", signature);

  return { hash, signature };
};

export const VerifyThread = async (
  armoredKey: string,
  signature: string | openpgp.Signature,
  entry: Partial<IThreadSimple>
) => {
  console.log("Verifying Thread", armoredKey, signature, entry);
  let publicKey = openpgp.readKey({
    armoredKey: armoredKey,
  });

  let parsedSig: Promise<openpgp.Signature>;

  if (signature instanceof openpgp.Signature) {
    console.log("Good signature", signature);
    parsedSig = Promise.resolve(signature);
  } else {
    parsedSig = openpgp.readSignature({ armoredSignature: signature });
  }

  let cleanEntry = _.cloneDeep(entry);
  delete cleanEntry.hash;
  delete cleanEntry.signature;

  let hash = await HashThread(cleanEntry);

  console.log("Hashed for verifying", hash);

  let testMessage = await openpgp.createMessage({
    text: hash,
  });

  return openpgp.verify({
    verificationKeys: [await publicKey],
    signature: await parsedSig,
    expectSigned: true,
    message: testMessage,
  });
};
