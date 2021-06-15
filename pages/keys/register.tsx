import React, { useState } from "react";
import { createMessage, decryptKey, readPrivateKey, sign } from "openpgp";
import { LabeledInput } from "../../components/labeledinput";
import Title from "../../components/title";
import { Header } from "../../components/header";
import { Policy } from "../../policy";

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
  const [newKeyFile, setNewKeyFile] = useState<File>();
  const [signingKeyFile, setSigningKeyFile] = useState<File>();
  const [password, setPassword] = useState<string>();
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (newKeyFile) {
      setUploading(true);
      const form = new FormData();

      const newkey = await readFile(newKeyFile);
      form.append("newkey", newkey);

      if (signingKeyFile && password) {
        const sk = await decryptKey({
          privateKey: await readPrivateKey({
            armoredKey: await readFile(signingKeyFile),
          }),
          passphrase: password,
        });

        const sig = await sign({
          message: await createMessage({ text: newkey }),
          signingKeys: sk,
          detached: true,
        });

        form.append("signature", sig);
      }

      const resp = await fetch("/api/regkey", {
        method: "post",
        body: form,
      });

      if (resp.ok) {
        alert("All keys registered");
      } else {
        alert("ERROR:" + (await resp.text()));
      }
      setUploading(false);
    }
  };

  return (
    <div>
      <Header prefix="Register keys" />
      <Title newThreads={false} />
      <div className="centeredFlex">
        <div className="desktop:w-1/2">
          <h1 className="text-center">Register key</h1>
          <p>
            Public keys must be uploaded to the {process.env.TITLE} server for
            verification.{" "}
            {Policy.publickey.preapproved
              ? "In accordance with the policy, all public keys must be approved before submitting threads. Please use information that the admins can use to identify you or contact them through other means to get verified"
              : ""}
            . By submitting your public keys{" "}
            {Policy.publickey.preapproved
              ? ", and considering that they are approved,"
              : ""}{" "}
            you understand that the name and email you used will be avaliable
            for anyone to read.
          </p>
          {Policy.publickey.preapproved ? (
            <details>
              <summary>More info about signing keys</summary>
              <p>
                To preserve privacy yet provide accountabilty,{" "}
                {process.env.TITLE} allows its users with already approved
                public/private key pairs to sign other public keys and use those
                to submit threads while appearing as a different identity. By
                providing approved keys for signing your new keys you will be
                identifying and taking responsibility for the actions signed by
                your new keys. {process.env.TITLE} will strive to not publish
                any link between any of your signed keys and as far as other
                readers are conserned, your new keys are a completely different
                identity
              </p>
            </details>
          ) : null}
          <form className="centeredFlex">
            <table>
              <LabeledInput
                label="new public key"
                type="file"
                accept="application/pgp"
                name="newkey"
                required
                onChange={(e) =>
                  e.target.files && setNewKeyFile(e.target.files[0])
                }
              />
              <LabeledInput
                label="signing key"
                type="file"
                accept="application/pgp"
                name="signer"
                onChange={(e) =>
                  e.target.files && setSigningKeyFile(e.target.files[0])
                }
              />
              <LabeledInput
                label="signing password"
                type="password"
                name="pasword"
                required={signingKeyFile ? true : false}
                onChange={(e) => setPassword(e.target.value)}
              />
              <tr>
                <td colSpan={2}>
                  <button
                    type="button"
                    className="w-full"
                    disabled={uploading}
                    onClick={() => upload()}
                  >
                    Upload{uploading ? "..." : ""}
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
