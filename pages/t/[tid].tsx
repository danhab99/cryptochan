import { GetServerSideProps, GetServerSidePropsResult } from "next";
import React, { useState, useRef } from "react";
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
  startPage: number;
  more: boolean;
  hash: string;
}

const ThreadPage: React.FC<ThreadPageProps> = (props) => {
  const page = useRef(props.startPage);
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState(props.replies);
  const [more, setMore] = useState(props.more);

  const loadMore = async () => {
    page.current += 1;
    setLoading(true);
    let resp = await fetch(`/api/t/${props.hash}?page=${page.current}`);

    if (resp.ok) {
      let threads: Array<IThread>;
      let moreAvaliable: boolean;

      ({ threads, moreAvaliable } = await resp.json());

      setReplies((prev) => (prev ? prev.concat(threads) : threads));
      setMore(moreAvaliable);
    } else {
      alert("Unable to fetch more");
      console.error(await resp.text());
    }
    setLoading(false);
  };

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

      {replies ? (
        <div className="replyBlock">
          {replies?.map((r) => (
            <ThreadComponent entry={r} />
          ))}
        </div>
      ) : null}

      {more ? (
        <div>
          <h3
            className="text-primary-700 text-center underline"
            onClick={() => loadMore()}
          >
            [Load more{loading ? "..." : ""}]
          </h3>
        </div>
      ) : null}
    </div>
  );
};

export default ThreadPage;

const PAGE_COUNT = 30;

export const getServerSideProps: GetServerSideProps<ThreadPageProps> = async ({
  params,
  query,
}): Promise<GetServerSidePropsResult<ThreadPageProps>> => {
  await connectDB();
  try {
    const tid = sanatizeParams(params?.tid);
    const page = parseInt((query.page as string) || "0");

    const thread = await sanatizeDB(Thread.findOne({ "hash.value": tid }));

    if (!thread) {
      return {
        notFound: true,
      };
    }

    const replies = await sanatizeDB(
      Thread.find({ parenthash: tid })
        .sort({ published: -1 })
        .skip(page * PAGE_COUNT)
        .limit(PAGE_COUNT)
    );

    if (thread?.parenthash) {
      const parent = sanatizeDB(
        Thread.findOne({ "hash.value": thread.parenthash })
      );

      return {
        props: {
          thread,
          parent: await parent,
          replies,
          more: replies.length >= PAGE_COUNT,
          startPage: page,
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
