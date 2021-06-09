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

const Home: React.FC<HomeProps> = (props) => {
  return (
    <div>
      <Header type="category" category="all" />
      <Title newThreads />

      {props.entries?.map((entry) => (
        <div>
          <ThreadComponent entry={entry as unknown as IThread} />
          <div className="ml-16">
            {entry?.replies?.map?.((reply) => {
              return <ThreadComponent entry={reply as unknown as IThread} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;

const PAGE_COUNT = 24;

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  query,
}) => {
  await connectDB();
  let q: HomeQueryParmas = query;

  _.defaults(q, {
    page: 0,
    sort: "date",
  });

  try {
    let entries = (await Thread.find({
      $or: [{ parenthash: "" }, { parenthash: undefined }],
    })
      .sort({ published: 1 })
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
