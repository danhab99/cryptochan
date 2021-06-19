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
import LoggingFactory from "../../middlewares/logging";

interface ThreadPageProps {
  threads: ThreadWithReplys;
  parents?: IThreadSimple[];
  startPage: number;
  more: boolean;
  hash: string;
}

const ThreadPage: React.FC<ThreadPageProps> = (props) => {
  return (
    <div>
      <Header prefix={props.threads[0].hash.value.slice(0, 8)} />
      <Title newThreads />

      {props.parents ? (
        <>
          {props.parents.map((thread, i) => (
            <ThreadComponent entry={thread} key={i} />
          ))}
          <hr />
        </>
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

const MAX_PREV_THREADS = 6;

export const getServerSideProps: GetServerSideProps<ThreadPageProps> = async ({
  params,
  query,
  req,
  res,
}): Promise<GetServerSidePropsResult<ThreadPageProps>> => {
  const log = LoggingFactory(req, res, "Thread props");
  await connectDB();
  try {
    const tid = sanatizeParams(params?.tid);
    const page = parseInt((query.page as string) || "0");

    log("Collecting replies for thread", tid, page);

    if (!tid) {
      log("No thread specified");
      return {
        notFound: true,
      };
    }

    const { threadsAndReplies, more } = await getThreadsAndReplies(
      { type: "replies", parent: tid },
      { page }
    );

    if (threadsAndReplies.length <= 0) {
      log("No thread found");
      return {
        notFound: true,
      };
    }

    let parents: IThreadSimple[] = [];

    if (threadsAndReplies[0].parenthash) {
      log(
        "Thread is a reply, collecting parent threads",
        threadsAndReplies[0].parenthash
      );
      parents.push(
        (await sanatizeDB(
          Thread.findOne({
            "hash.value": threadsAndReplies[0].parenthash,
            approved: true,
          })
        )) as IThreadSimple
      );

      while (parents.length < MAX_PREV_THREADS && parents[0].parenthash) {
        log("Collecting last generation", parents.length);
        const parent = (await sanatizeDB(
          Thread.findOne({
            "hash.value": parents[0].parenthash,
            approved: true,
          })
        )) as IThreadSimple;

        if (parent) {
          parents.unshift(parent);
        } else {
          log("Reached end of thread");
          break;
        }
      }
    }

    return {
      props: {
        threads: threadsAndReplies,
        parents,
        more,
        startPage: page,
        hash: tid,
      },
    };
  } catch (e) {
    log("Thread error", e);
    if (e instanceof ParamNotFoundError) {
      return Promise.resolve({
        notFound: true,
      });
    } else {
      throw e;
    }
  }
};
