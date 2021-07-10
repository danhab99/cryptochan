import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import * as openpgp from "openpgp";

const useMasterKey = (): [
  openpgp.PrivateKey | undefined,
  (armored: string) => Promise<openpgp.DecryptMessageResult & { data: string }>
] => {
  const [mk, setMK] = useState<openpgp.PrivateKey>();
  const router = useRouter();

  useEffect(() => {
    let armoredMK = window.sessionStorage.getItem("masterkey");

    try {
      if (armoredMK) {
        openpgp
          .readPrivateKey({
            armoredKey: armoredMK,
          })
          .then((pk) => {
            setMK(pk);
          });
      } else {
        throw new Error("");
      }
    } catch (e) {
      console.error(e);
      router.push("/admin");
    }
  }, []);

  const decrypt = async (armored: string) => {
    let p = openpgp.decrypt({
      decryptionKeys: mk,
      message: await openpgp.readMessage({ armoredMessage: armored }),
    });

    p.catch((e) => {
      console.error(e);
      router.push("/admin");
    });

    return p;
  };

  return [mk, decrypt];
};

export default useMasterKey;
