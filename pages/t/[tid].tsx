import { GetServerSideProps, GetServerSidePropsResult } from "next";
import React from "react";
import { Header } from "../../components/header";
import _ from "lodash";
import { Thread, IThreadSimple } from "../../schemas/Thread";
import connectDB from "../../middlewares/mongoose";
import Title from "../../components/title";
import ThreadComponent from "../../components/thread";
import {
  ParamNotFoundError,
  sanatizeDB,
  sanatizeParams,
} from "../../sanatizeQuery";
import {
  getThreadsAndReplies,
  ThreadWithReplys,
} from "../../query/getThreadsAndReplies";
import { ThreadList } from "../../components/threadList";

interface ThreadPageProps {
  threads: ThreadWithReplys;
  parent?: IThreadSimple;
  startPage: number;
  more: boolean;
  hash: string;
}

const ThreadPage: React.FC<ThreadPageProps> = (props) => {
  return (
    <div>
      <Header prefix={props.threads[0].hash.value.slice(0, 8)} />
      <Title newThreads />

      {props.parent ? (
        <div>
          <ThreadComponent entry={props.parent} />
          <hr />
        </div>
      ) : null}

      <ThreadList
        threads={props.threads}
        more={props.more}
        source={`/t/${props.hash}`}
        startPage={props.startPage}
      />
    </div>
  );
};

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<ThreadPageProps> = async ({
  params,
  query,
}): Promise<GetServerSidePropsResult<ThreadPageProps>> => {
  await connectDB();
  try {
    const tid = sanatizeParams(params?.tid);
    const page = parseInt((query.page as string) || "0");

    if (!tid) {
      return {
        notFound: true,
      };
    }

    const { threadsAndReplies, more } = await getThreadsAndReplies(
      { type: "replies", parent: tid },
      { page }
    );

    if (threadsAndReplies.length <= 0) {
      return {
        notFound: true,
      };
    }

    const parent = (await sanatizeDB(
      Thread.findOne({
        "hash.value": threadsAndReplies[0].parenthash,
        approved: true,
      })
    )) as IThreadSimple;

    return {
      props: {
        threads: threadsAndReplies,
        parent,
        more,
        startPage: page,
        hash: tid,
      },
    };
  } catch (e) {
    if (e instanceof ParamNotFoundError) {
      return Promise.resolve({
        notFound: true,
      });
    } else {
      throw e;
    }
  }
};
