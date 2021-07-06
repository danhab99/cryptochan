import React, { useState } from "react";
import { Header } from "../../components/header";
import Title from "../../components/title";
import { LabeledInput } from "../../components/labeledinput";
import * as openpgp from "openpgp";
import { readFileAsString } from "../../readFile";
import Link from "next/link";

enum STATUS {
  BLANK = "",
  GOOD = "Decryption successful",
  FAILURE = "Unable to decrypt",
}

const AdminPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [keyFile, setKeyFile] = useState<File>();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<STATUS>(STATUS.BLANK);

  const test = async () => {
    if (keyFile && password) {
      let k = await readFileAsString(keyFile);

      try {
        let mk = await openpgp.decryptKey({
          privateKey: await openpgp.readPrivateKey({ armoredKey: k }),
          passphrase: password,
        });

        setLoading(true);
        setStatus(STATUS.BLANK);

        let resp = await fetch("/api/admin");
        let testPayload = await resp.text();

        try {
          let payload = await openpgp.decrypt({
            message: await openpgp.readMessage({ armoredMessage: testPayload }),
            decryptionKeys: [mk],
          });

          let raw = payload.data as string;

          let res = JSON.parse(raw);

          if (res?.success) {
            setStatus(STATUS.GOOD);
            window.sessionStorage.setItem("masterkey", mk.armor());
          } else {
            setStatus(STATUS.FAILURE);
          }
        } catch (e) {
          setStatus(STATUS.FAILURE);
          console.error(e);
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
        alert("Unable to decrypt master key");
      }
    }
  };

  return (
    <div>
      <Header prefix="Admin" />
      <Title newThreads={false} />

      <h1 className="text-red-600 text-center font-bold">
        WARNING!! This page is reserved for those who possess a valid master
        key. If you are not an administrator please click off.
      </h1>

      <form className="centeredFlex">
        <table>
          <tbody>
            <LabeledInput
              type="file"
              accept="application/pgp"
              label="master key"
              onChange={(e) => setKeyFile(e.target.files?.[0])}
            />
            <LabeledInput
              type="password"
              label="password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <tr>
              <td colSpan={2}>
                <button type="button" className="w-full" onClick={() => test()}>
                  {loading ? "Decrypting..." : "Decrypt"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      {(() => {
        switch (status) {
          case STATUS.GOOD:
            return (
              <div>
                <h1 className="text-green-600">Good key</h1>

                <ul>
                  <li>
                    <Link href="/admin/threads">
                      <a>Manage threads</a>
                    </Link>
                  </li>
                  <li>
                  <Link href="/admin/pks">
                  <a>Manage public keys</a>
                  </Link>
                  </li>
                </ul>
              </div>
            );

          case STATUS.FAILURE:
            return (
              <div>
                <h1 className="text-red-500">Unauthorized key</h1>
              </div>
            );
        }
      })()}
    </div>
  );
};

export default AdminPage;
