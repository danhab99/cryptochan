import { GetServerSideProps } from "next";
import React from "react";
import { Header } from "../../components/header";
import _ from "lodash";
import { Thread, IThread } from "../../schemas/Thread";
import connectDB from "../../middlewares/mongoose";
import Title from "../../components/title";
import ThreadComponent from "../../components/thread";
import sanatize from "../../sanatizeQuery";
import { LeanDocument, Query } from "mongoose";
import { ParsedUrlQuery } from "querystring";

interface ThreadPageProps {
  thread: IThread;
  parent?: IThread;
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

interface ServerSideProps extends ParsedUrlQuery {
  tid: string;
}

export const getServerSideProps: GetServerSideProps<
  ThreadPageProps,
  ServerSideProps
> = async ({ params }) => {
  await connectDB();
  const tid = params?.tid || "";

  const thread = await sanatize(Thread.findOne({ "hash.value": tid }));
  const replies = sanatize(Thread.find({ parenthash: tid }));

  if (thread?.parenthash) {
    const parent = sanatize(
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
};
