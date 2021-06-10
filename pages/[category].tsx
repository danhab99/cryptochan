import { GetServerSideProps } from "next";
import React from "react";
import { Header } from "../components/header";
import _ from "lodash";
import { Thread, IThread, IThreadSimple } from "../schemas/Thread";
import connectDB from "../middlewares/mongoose";
import Title from "../components/title";
import ThreadComponent from "../components/thread";
import { sanatizeDB } from "../sanatizeQuery";

type ThreadWithReply = IThreadSimple & { replyThreads: Array<IThreadSimple> };

type ThreadWithReplys = Array<ThreadWithReply>;

type HomeProps = { entries?: ThreadWithReplys; error?: Error };

interface HomeQueryParmas {
  page: number;
  sort: "bump" | "date";
}

const Category: React.FC<HomeProps> = (props) => {
  return (
    <div>
      <Header type="category" category="all" />
      <Title newThreads />

      {props.entries?.map((entry) => (
        <div>
          <ThreadComponent entry={entry as unknown as IThread} />
          <div className="replyBlock">
            {entry?.replyThreads?.map?.((reply) => {
              return <ThreadComponent entry={reply as unknown as IThread} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Category;

const PAGE_COUNT = 24;

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
    let entries = (await sanatizeDB(
      Thread.find({
        $or: [{ parenthash: "" }, { parenthash: undefined }],
        ...(category === "all" ? {} : { category }),
      })
        .sort({ published: -1 })
        .skip(q.page * PAGE_COUNT)
        .limit(PAGE_COUNT)
    )) as IThread[];

    let entriesAndReplies: ThreadWithReplys = await Promise.all(
      entries.map(async (entry) => {
        const replyThreads = await sanatizeDB(
          Thread.find({ parenthash: entry.hash.value })
            .sort({ published: -1 })
            .limit(5)
        );
        return {
          ...entry,
          replyThreads,
        };
      })
    );

    return {
      props: {
        entries: entriesAndReplies,
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
