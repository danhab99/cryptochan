import { PublicKey, IPublicKey } from "../schemas/PublicKey";
import * as openpgp from "openpgp";

const VerifyMaster = async (armored: string): Promise<string | boolean> => {
  let mks = await PublicKey.find({ "clearance.master": true });
  if (mks) {
    let verify = await openpgp.verify({
      message: (await openpgp.readCleartextMessage({
        cleartextMessage: armored,
      })) as any,
      verificationKeys: await Promise.all(
        mks.map((mk: IPublicKey) => openpgp.readKey({ armoredKey: mk.key }))
      ),
    });

    let verifications = await Promise.all(
      verify.signatures.map((x) => x.verified)
    );

    if (verifications.some((x) => x)) {
      return verify.data as string;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export default VerifyMaster;
