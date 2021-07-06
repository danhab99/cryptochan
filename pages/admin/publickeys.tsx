import React, { useState, useEffect } from "react";
import { Header } from "../../components/header";
import Title from "../../components/title";
import useMasterKey from "../../components/useMasterKey";
import stringify from "json-stable-stringify";
import * as openpgp from "openpgp";
import { IPublicKey, PublicKey } from "../../schemas/PublicKey";
import Link from "next/link";

const AdminPublicKey: React.FC = () => {
  const [masterKey, decrypt] = useMasterKey();
  const [page, setPage] = useState(0);
  const [publicKeys, setPublicKeys] = useState<IPublicKey[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (masterKey) {
        setLoading(true);
        let resp = await fetch(`/api/admin/pks?page=${page}`);
        let pks = await decrypt(await resp.text());
        setPublicKeys(JSON.parse(pks.data));
        setLoading(false);
      }
    })();
  }, [masterKey, page]);

  const change = async (pkid: string, approved: boolean) => {
    let signPayload = await openpgp.sign({
      message: await openpgp.createCleartextMessage({
        text: stringify({ pkid, approved }),
      }),
      signingKeys: masterKey,
    });

    let resp = await fetch("/api/admin/pks", {
      method: "post",
      body: signPayload,
    });

    console.log(resp);
  };

  return (
    <div>
      <Header prefix="Admin Threads" />
      <Title newThreads={false} />

      <header className="text-center">
        <h2>Manage threads</h2>
      </header>

      {page > 0 ? (
        <button onClick={() => setPage((x) => x - 1)}>Previous page</button>
      ) : null}
      <button onClick={() => setPage((x) => x + 1)}>Next page</button>

      {loading ? <h3>Getting public keys...</h3> : null}

      <div className="overflow-x-scroll">
        <table>
          <thead>
            <tr>
              <td>User ID</td>
              <td>Approved</td>
              <td>Viable</td>
              <td>Key ID</td>
              <td>Signatore</td>
            </tr>
          </thead>
          <tbody>
            {publicKeys.map((pk, i) => (
              <tr key={`${i}`}>
                <td className="whitespace-nowrap">{pk.owner.userID}</td>
                <td className="flex flex-row justify-center">
                  <input
                    type="checkbox"
                    defaultChecked={pk.approved}
                    disabled={pk.revoked}
                    onChange={(e) => change(pk.keyid, e.target.checked
                    )}
                  />
                </td>
                <td className={pk.revoked ? "text-revoked-500" : ""}>
                  {pk.revoked ? "revoked" : "in use"}
                </td>
                <td>
                  <Link href={`/pk/${pk.keyid}`}>
                    <a className="text-primary-500">{pk.keyid}</a>
                  </Link>
                </td>
                <td>{pk.signingKeyID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPublicKey;
