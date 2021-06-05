import React, { useState } from "react";
import { generateKey } from "openpgp";
import { LabeledInput } from "../components/labeledinput";
import Title from "../components/title";
import { Header } from "../components/header";

const downloadToFile = (
  content: any,
  filename: string,
  contentType: string
): void => {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();

  URL.revokeObjectURL(a.href);
};

const MoreInfo: React.FC<{ link: string }> = (props) => {
  return (
    <>
      You can learn more about it <a href={props.link}>here</a>.
    </>
  );
};

const NewKeys: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const { privateKeyArmored, publicKeyArmored, revocationCertificate } =
      await generateKey({
        type: "ecc", // Type of the key, defaults to ECC
        curve: "curve25519", // ECC curve name, defaults to curve25519
        userIDs: [{ name, email }], // you can pass multiple user IDs
        passphrase: password, // protects the private key
      });

    setGenerating(false);
    const filename = `${name.replace(/\s/g, "_")}_${email.replace(
      /[\@\.]/g,
      "_"
    )}_key.gpg`;
    downloadToFile(publicKeyArmored, filename + ".pub", "application/pgp");
    downloadToFile(privateKeyArmored, filename + ".secret", "application/pgp");
    downloadToFile(revocationCertificate, filename + ".rev", "application/pgp");
  };

  return (
    <div>
      <Header />
      <Title newThreads={false} />
      <div className="flex flex-row justify-center">
        <div className="w-1/2">
          <h1 className="text-center">Generate new key</h1>
          <p>
            This utility is for generating PGP crypto keys meant exclusivly for
            signing and verifying entries. Be mindful that no secrets and
            passwords will be transmitted to {process.env.TITLE}, instead you
            will be expected to keep your secret key secure. Your secret key and
            password are not recoverable.
          </p>
          <details>
            <summary>More info</summary>
            <p>
              When you click <code>Generate</code> you will be saving 3 files to
              your device.
              <ol>
                <li>
                  <p>
                    The <code>.pub</code> file is your public key, it is not a
                    secret and you are free to give it to whoever asks for it
                    without consequences. It is used to verify that an entry you
                    signed is actually yours.{" "}
                    <MoreInfo link="https://en.wikipedia.org/wiki/Public-key_cryptography" />
                  </p>
                </li>
                <li>
                  <p>
                    The <code>.secret</code> file is used to sign your entries.{" "}
                    <strong>
                      DO NOT UNDER ANY CIRCUMSTANCES LOOSE CONTROL OF THIS FILE
                    </strong>
                    . Anyone who has this file can sign whatever they want with
                    it and everybody will thing that it was you. As citizens of
                    the internet, we can all imagine some less that moral things
                    we don't want someone else signing with our name.{" "}
                    <MoreInfo link="https://en.wikipedia.org/wiki/Public-key_cryptography" />
                  </p>
                </li>
                <li>
                  <p>
                    The <code>.rev</code> file is used to inform the world that
                    your secret key was compromised and should be ignored. You
                    cannot guarantee that everybody will respect your wishes and
                    you should not rely on this file as a get-out-of-jail-free
                    card.{" "}
                    <MoreInfo link="http://www.spywarewarrior.com/uiuc/ss/revoke/pgp-revoke.htm" />
                  </p>
                </li>
              </ol>
            </p>
          </details>
          <form className="flex flex-row justify-center">
            <table>
              <LabeledInput
                label="name"
                type="text"
                name="name"
                onChange={(e) => setName(e.target.value)}
              />
              <LabeledInput
                label="email"
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <LabeledInput
                label="password"
                type="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </table>
          </form>
          <button
            type="button"
            className="w-full"
            disabled={generating}
            onClick={() => generate()}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewKeys;
