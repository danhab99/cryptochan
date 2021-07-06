import React, { useState, useEffect } from "react";
import { Header } from "../../components/header";
import Title from "../../components/title";
import useMasterKey from "../../components/useMasterKey";
import { IThreadSimple } from "../../schemas/Thread";
import ThreadComponent from "../../components/thread";
import stringify from "json-stable-stringify";
import * as openpgp from "openpgp";

const ControlledThread: React.FC<{ thread: IThreadSimple }> = ({ thread }) => {
  const [cthread, setCThread] = useState(thread);
  const [masterKey] = useMasterKey();
  const [loading, setLoading] = useState(false);

  const doDirective = async (action: any) => {
    setLoading(true);

    let payload = stringify(action);
    let signedPayload = await openpgp.sign({
      message: await openpgp.createCleartextMessage({ text: payload }),
      signingKeys: masterKey,
    });

    let resp = await fetch("/api/admin/threads", {
      method: "post",
      body: signedPayload,
    });

    if (!resp.ok) {
      alert(`Unable to change ${thread.hash.value}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex flex-row bg-background-700 p-0.5 w-min">
        <input
          type="checkbox"
          defaultChecked={cthread.approved}
          name={`approved${cthread.hash.value}`}
          onChange={() => {
            setCThread((prev) => ({ ...cthread, approved: !prev.approved }));
            doDirective({
              action: "approve",
              approved: !cthread.approved,
              hash: thread.hash.value
            });
          }}
        />
        <label className="text-white" htmlFor={`approved${cthread.hash.value}`}>
          Approved
        </label>

        <input
          type="checkbox"
          defaultChecked={cthread.replies}
          name={`replies${cthread.hash.value}`}
          onChange={() => {
            setCThread((prev) => ({ ...cthread, replies: !prev.replies }));
            doDirective({
              action: "replies",
              replies: !cthread.replies,
              hash: thread.hash.value
            });
          }}
        />
        <label className="text-white" htmlFor={`replies${cthread.hash.value}`}>
          Replies
        </label>

        {loading ? <label className="text-white">Updating...</label> : null}
      </div>
      <ThreadComponent entry={thread} />
    </div>
  );
};

const AdminThreads: React.FC = () => {
  const [masterKey, decrypt] = useMasterKey();
  const [page, setPage] = useState(0);
  const [threads, setThreads] = useState<IThreadSimple[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (masterKey) {
        setLoading(true);
        let resp = await fetch(`/api/admin/threads?page=${page}`);

        let threads = await decrypt(await resp.text());
        setThreads(JSON.parse(threads.data));
        setLoading(false);
      }
    })();
  }, [masterKey, page]);

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

      {loading ? <h3>Getting threads...</h3> : null}

      {threads.map((thread) => (
        <ControlledThread thread={thread} />
      ))}
    </div>
  );
};

export default AdminThreads;
