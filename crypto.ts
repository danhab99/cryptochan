import * as openpgp from "openpgp";
import { decode } from "base64-arraybuffer";
import { IThreadSimple } from "./schemas/Thread";
import { Policy } from "./policy";
import _ from "lodash";
import stringify from "json-stable-stringify";
import * as node_crypto from "crypto";

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

const HashThread = async (entry: Partial<IThreadSimple>) => {
  console.log("Hashing thread", entry);
  const serialized = stringify(entry);
  console.log("Hashing input", serialized);
  let hash = await HashArrayBuffer(decode(serialized));
  console.log("Hash", hash);

  return hash;
};

const sanatizeThread = (thread: Partial<IThreadSimple>) => {
  let cleanThread: any = _.cloneDeep(thread);
  delete cleanThread.hash;
  delete cleanThread.signature;
  delete cleanThread.__v;
  delete cleanThread.replies;
  delete cleanThread.replyThreads;
  delete cleanThread.approved;
  return cleanThread;
};

const stringifyThread = (thread: Partial<IThreadSimple>) =>
  stringify(sanatizeThread(thread));

export interface ThreadSignature {
  hash: string;
  signature: string;
  thread: IThreadSimple;
}

export const SignThread = async (
  armoredKey: string,
  passphrase: string,
  thread: Partial<IThreadSimple>
): Promise<ThreadSignature> => {
  console.log("Signing Thread", armoredKey, thread);

  let unsignedMessage = openpgp.createMessage({
    text: stringifyThread(thread),
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

  let newThread: IThreadSimple = {
    ...(thread as IThreadSimple),
    signature,
  };

  let hash = await HashThread(newThread);

  console.log("Hash", hash);

  newThread.hash = {
    algorithm: Policy.hash_algo,
    value: hash,
  };

  return { hash, signature, thread: newThread };
};

export const VerifyThread = async (
  armoredKey: string,
  signature: string | openpgp.Signature,
  thread: Partial<IThreadSimple>
): Promise<boolean> => {
  console.log("Verifying Thread", armoredKey, signature, thread);
  let publicKey = openpgp.readKey({
    armoredKey: armoredKey,
  });

  let parsedSig: openpgp.Signature;

  if (signature instanceof openpgp.Signature) {
    parsedSig = signature;
  } else {
    parsedSig = await openpgp.readSignature({ armoredSignature: signature });
  }

  let testMessage = await openpgp.createMessage({
    text: stringifyThread(thread),
  });

  let verify = await openpgp.verify({
    verificationKeys: [await publicKey],
    signature: parsedSig,
    expectSigned: true,
    message: testMessage,
  });

  let valid = await Promise.all(
    verify.signatures
      .filter((x) =>
        parsedSig
          .getSigningKeyIDs()
          .map((x) => x.toHex())
          .includes(x.keyID?.toHex?.())
      )
      .map((x) => x.verified)
  );

  return valid.every((x) => x);
};
