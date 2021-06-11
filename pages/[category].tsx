import { GetServerSideProps } from "next";
import React, { useState } from "react";
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
} from "./getEntriesInCategory";

type HomeProps = { threads?: ThreadWithReplys; error?: Error; more: boolean };

const Category: React.FC<HomeProps> = (props) => {
  const [threads, setThreads] = useState(props.threads);

  return (
    <div>
      <Header type="category" category="all" />
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
