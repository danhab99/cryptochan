import { GetServerSideProps, GetServerSidePropsResult } from "next";
import React from "react";
import { Header } from "../../components/header";
import _ from "lodash";
import { Thread, IThread } from "../../schemas/Thread";
import connectDB from "../../middlewares/mongoose";
import Title from "../../components/title";
import ThreadComponent from "../../components/thread";
import {
  ParamNotFoundError,
  sanatizeDB,
  sanatizeParams,
} from "../../sanatizeQuery";

interface ThreadPageProps {
  thread: IThread;
  parent?: IThread | null;
  replies?: Array<IThread>;
}

const ThreadPage: React.FC<ThreadPageProps> = (props) => {
  return (
    <div>
      <Header type="entry" entry={props.thread} />
      <Title newThreads />

      {props.parent ? (
        <div>
          <ThreadComponent entry={props.parent} />
          <hr />
        </div>
      ) : null}

      <ThreadComponent entry={props.thread} />

      {props.replies ? (
        <div className="replyBlock">
          {props.replies.map((r) => (
            <ThreadComponent entry={r} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ThreadPage;

export const getServerSideProps: GetServerSideProps<ThreadPageProps> = async ({
  params,
}): Promise<GetServerSidePropsResult<ThreadPageProps>> => {
  await connectDB();
  try {
    const tid = sanatizeParams(params?.tid);

    const thread = await sanatizeDB(Thread.findOne({ "hash.value": tid }));

    if (!thread) {
      return {
        notFound: true,
      };
    }

    const replies = sanatizeDB(
      Thread.find({ parenthash: tid }).sort({ published: -1 })
    );

    if (thread?.parenthash) {
      const parent = sanatizeDB(
        Thread.findOne({ "hash.value": thread.parenthash })
      );

      return {
        props: {
          thread,
          parent: await parent,
          replies: await replies,
        },
      };
    }

    return {
      props: {
        thread,
        replies: await replies,
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
