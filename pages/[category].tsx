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
import LoggingFactory from "../middlewares/logging";
import { Category as ICategory } from "../IPolicy";
import { Policy } from "../policy";

type HomeProps = {
  threads: ThreadWithReplys;
  more: boolean;
  startPage: number;
  category: ICategory;
};

const Category: React.FC<HomeProps> = (props) => {
  return (
    <div>
      <Header prefix={props.category.name} />
      <Title newThreads />

      <header>
        <p className="text-center">
          <span className="text-primary-800 text-2xl font-bold align-middle">
            {props.category.title}
            {" - "}
          </span>
          <span className="align-middle">{props.category.description}</span>
        </p>
      </header>

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
  req,
  res,
}) => {
  const log = LoggingFactory(req, res, "Category props");
  await connectDB();

  const page = parseInt(sanatizeParams(query.page, "0"));
  const c = sanatizeParams(params?.["category"]);
  log("Getting category", c, page);
  const category = Policy.categories.filter((x) => x.name === c)[0];

  if (!category) {
    log("Not found");
    return {
      notFound: true,
    };
  }

  try {
    const { threadsAndReplies, more } = await getThreadsAndReplies(
      { type: "category", category: category.name },
      {
        page,
      }
    );

    log("Collected threads");

    return {
      props: {
        threads: threadsAndReplies,
        more,
        startPage: page,
        category,
      },
    };
  } catch (e) {
    log("Error", e);
    return {
      props: {
        error: e,
      },
    };
  }
};
