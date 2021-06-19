import React, { useState } from "react";
import { decryptKey, enums, readPrivateKey } from "openpgp";
import { LabeledInput, LabeledRow } from "../../components/labeledinput";
import Title from "../../components/title";
import { Header } from "../../components/header";

const readFile = (f: File): Promise<string> => {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve((reader.result as string) || "");
    };
    reader.readAsText(f);
  });
};

const NewKeys: React.FC = () => {
  const [skFile, setSkFile] = useState<File>();
  const [password, setPassword] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [reason, setReason] = useState<enums.reasonForRevocation>();

  const upload = async () => {
    if (skFile && password) {
      setUploading(true);
      const form = new FormData();

      const sk = await decryptKey({
        privateKey: await readPrivateKey({
          armoredKey: await readFile(skFile),
        }),
        passphrase: password,
      });

      const revSK = await sk.revoke({
        flag: reason || enums.reasonForRevocation.noReason,
      });

      form.append("publickey", revSK.toPublic().armor());

      const resp = await fetch("/api/revoke", {
        method: "post",
        body: form,
      });

      if (resp.ok) {
        window.location.href = `/pk/${sk.toPublic().getKeyID().toHex()}`;
      } else {
        alert("Unable to revoke");
      }

      setUploading(false);
    }
  };

  return (
    <div>
      <Header prefix="Revoke keys" />
      <Title newThreads={false} />
      <div className="centeredFlex">
        <div className="desktop:w-1/2">
          <h1 className="text-center">Revoke a key</h1>
          <p>
            In the event you believe that your private key has been compromised
            or you do not wish to use it anymore, fill out this form to announce
            to {process.env.NEXT_PUBLIC_TITLE} and all related peers that no new
            thread may be signed with this public/private key pair. Please note
            that this will not delete existing threads.
          </p>
          <form className="centeredFlex">
            <table>
              <LabeledInput
                label="private key"
                type="file"
                accept="application/pgp"
                name="newkey"
                required
                onChange={(e) => e.target.files && setSkFile(e.target.files[0])}
              />
              <LabeledInput
                label="password"
                type="password"
                name="pasword"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <LabeledRow label="reason">
                <select
                  onChange={(e) =>
                    setReason(
                      e.target.value as unknown as enums.reasonForRevocation
                    )
                  }
                >
                  <option value={enums.reasonForRevocation.noReason}>
                    No reason
                  </option>
                  <option value={enums.reasonForRevocation.keyCompromised}>
                    Key might be compromised
                  </option>
                  <option value={enums.reasonForRevocation.keyRetired}>
                    I don&apos;t want to use this key anymore
                  </option>
                  <option value={enums.reasonForRevocation.keySuperseded}>
                    Using new key
                  </option>
                  <option value={enums.reasonForRevocation.userIDInvalid}>
                    Invalid user ID
                  </option>
                </select>
              </LabeledRow>
              <tr>
                <td colSpan={2}>
                  <button
                    type="button"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => upload()}
                  >
                    Revoke{uploading ? "..." : ""}
                  </button>
                </td>
              </tr>
            </table>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewKeys;
