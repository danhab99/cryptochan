import React, { useState, useRef } from "react";
import { ThreadWithReplys } from "../query/getThreadsAndReplies";
import ThreadComponent from "./thread";

interface ThreadListProps {
  threads: ThreadWithReplys;
  more: boolean;
  source: string;
  startPage: number;
}

export const ThreadList: React.FC<ThreadListProps> = (props) => {
  const [threads, setThreads] = useState(props.threads);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(props.more);
  const page = useRef(props.startPage);

  const loadMore = async () => {
    page.current += 1;
    setLoading(true);
    let resp = await fetch(`/api/${props.source}?page=${page.current}`);

    if (resp.ok) {
      let threads: ThreadWithReplys;
      let moreAvaliable: boolean;

      ({ threads, moreAvaliable } = await resp.json());

      setThreads((prev) => (prev ? prev.concat(threads) : threads));
      setMore(moreAvaliable);
    } else {
      alert("Unable to fetch more");
      console.error(await resp.text());
    }
    setLoading(false);
  };

  return (
    <div>
      {threads?.map((thread) => (
        <div>
          <ThreadComponent entry={thread} />
          <div className="replyBlock">
            {thread?.replyThreads?.map?.((reply) => {
              return <ThreadComponent entry={reply} />;
            })}
          </div>
        </div>
      ))}

      {more ? (
        <div>
          <h3
            className="text-primary-700 text-center underline"
            onClick={() => loadMore()}
          >
            [Load more{loading ? "..." : ""}]
          </h3>
        </div>
      ) : null}
    </div>
  );
};
