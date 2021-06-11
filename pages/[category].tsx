import { GetServerSideProps } from "next";
import React, { useState } from "react";
import { Header } from "../components/header";
import _ from "lodash";
import { IThread } from "../schemas/Thread";
import connectDB from "../middlewares/mongoose";
import Title from "../components/title";
import ThreadComponent from "../components/thread";
import {
  getEntriesInCategory,
  HomeQueryParmas,
  PAGE_COUNT,
  ThreadWithReplys,
} from "./getEntriesInCategory";

type HomeProps = { entries?: ThreadWithReplys; error?: Error; more: boolean };

const Category: React.FC<HomeProps> = (props) => {
  const [entries, setEntries] = useState(props.entries);

  return (
    <div>
      <Header type="category" category="all" />
      <Title newThreads />

      {entries?.map((entry) => (
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
    let { entriesAndReplies, entries } = await getEntriesInCategory(
      category,
      q
    );

    return {
      props: {
        entries: entriesAndReplies,
        more: entries.length >= PAGE_COUNT,
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
