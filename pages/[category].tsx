import { GetServerSideProps } from "next";
import React from "react";
import { Header } from "../components/header";
import _ from "lodash";
import connectDB from "../middlewares/mongoose";
import Title from "../components/title";
import {
  getThreadsAndReplies,
  ThreadWithReplys,
} from "../query/getThreadsAndReplies";
import { sanatizeParams } from "../sanatizeQuery";
import { ThreadList } from "../components/threadList";

type HomeProps = {
  threads: ThreadWithReplys;
  more: boolean;
  startPage: number;
  category: string;
};

const Category: React.FC<HomeProps> = (props) => {
  return (
    <div>
      <Header prefix={props.category} />
      <Title newThreads />

      <ThreadList
        threads={props.threads}
        more={props.more}
        source={`/c/${props.category}`}
        startPage={props.startPage}
      />
    </div>
  );
};

export default Category;

export const getServerSideProps: GetServerSideProps = async ({
  query,
  params,
}) => {
  await connectDB();

  const page = parseInt(sanatizeParams(query.page, "0"));
  const category = sanatizeParams(params?.["category"]);

  if (!category) {
    return {
      notFound: true,
    };
  }

  try {
    const { threadsAndReplies, more } = await getThreadsAndReplies(
      { type: "category", category: category },
      {
        page,
      }
    );

    return {
      props: {
        threads: threadsAndReplies,
        more,
        startPage: page,
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
