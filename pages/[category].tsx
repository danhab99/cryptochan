import { GetServerSideProps } from "next";
import React, { useState, useRef } from "react";
import { Header } from "../components/header";
import _ from "lodash";
import { IThread } from "../schemas/Thread";
import connectDB from "../middlewares/mongoose";
import Title from "../components/title";
import ThreadComponent from "../components/thread";
import {
  getThreadsInCategory,
  HomeQueryParmas,
  PAGE_COUNT,
  ThreadWithReplys,
} from "../query/getThreadsInCategory";

type HomeProps = {
  threads?: ThreadWithReplys;
  error?: Error;
  more: boolean;
  startPage: number;
  category: string;
};

const Category: React.FC<HomeProps> = (props) => {
  const [threads, setThreads] = useState(props.threads);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(props.more);
  const page = useRef(props.startPage);

  const loadMore = async () => {
    page.current += 1;
    setLoading(true);
    let resp = await fetch(`/api/c/${props.category}?page=${page.current}`);

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
      <Header prefix={props.category} />
      <Title newThreads />

      {threads?.map((thread) => (
        <div>
          <ThreadComponent entry={thread as unknown as IThread} />
          <div className="replyBlock">
            {thread?.replyThreads?.map?.((reply) => {
              return <ThreadComponent entry={reply as unknown as IThread} />;
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

export default Category;

export const getServerSideProps: GetServerSideProps = async ({
  query,
  params,
}) => {
  await connectDB();
  let q: HomeQueryParmas = {
    page: typeof query.page === "string" ? parseInt(query.page) : 0,
    sort: "date",
  };

  if (!params) {
    return {
      notFound: true,
    };
  }
  let category = params["category"];

  if (!category || Array.isArray(category)) {
    return {
      notFound: true,
    };
  }

  _.defaults(q, {
    page: 0,
    sort: "date",
  });

  try {
    let { threadsAndReplies, threads } = await getThreadsInCategory(
      category,
      q
    );

    return {
      props: {
        threads: threadsAndReplies,
        more: threads.length >= PAGE_COUNT,
        startPage: q.page,
        category,
      },
    };
  } catch (e) {
    return {
      props: {
        error: e,
      },
    };
  }
};
