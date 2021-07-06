import { PublicKey } from "../schemas/PublicKey";
import * as openpgp from "openpgp";

const encryptForMaster = async (payload: any) => {
  let masters = await PublicKey.find({ "clearance.master": true });

  if (!masters) {
    throw new Error("No masters found");
  }

  let mpks: openpgp.PublicKey[] = await Promise.all<openpgp.PublicKey>(
    masters.map((x) => openpgp.readKey({ armoredKey: x.key }))
  );

  let encryptedPayload = await openpgp.encrypt({
    message: await openpgp.createMessage({
      text: JSON.stringify(payload),
    }),
    encryptionKeys: mpks,
    armor: true,
  });

  return encryptedPayload;
};

export default encryptForMaster;
