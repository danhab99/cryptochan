import { GetServerSideProps } from "next";
import React from "react";
import { Header } from "../components/header";
import _ from "lodash";
import { Thread, IThread } from "../schemas/Thread";
import connectDB from "../middlewares/mongoose";
import Title from "../components/title";
import ThreadComponent from "../components/thread";

type ThreadWithReplys = Array<IThread & { replies: Array<IThread> }>;

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
            {entry?.replies?.map?.((reply) => {
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

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  query,
  params,
}) => {
  await connectDB();
  let q: HomeQueryParmas = query;
  let { category } = params;

  _.defaults(q, {
    page: 0,
    sort: "date",
  });

  try {
    let entries = (await Thread.find({
      $or: [{ parenthash: "" }, { parenthash: undefined }],
      ...(category === "all" ? {} : { category }),
    })
      .sort({ published: -1 })
      .skip(q.page * PAGE_COUNT)
      .limit(PAGE_COUNT)
      .select({
        _id: false,
        embeds: {
          _id: false,
        },
      })
      .lean()) as IThread[];

    let entriesAndReplies: ThreadWithReplys = await Promise.all(
      entries.map((entry) => {
        return Thread.find({ parenthash: entry.hash.value })
          .select({
            _id: false,
            embeds: {
              _id: false,
            },
          })
          .limit(5)
          .lean()
          .then((replies) => {
            return {
              ...entry,
              replies,
            };
          });
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
