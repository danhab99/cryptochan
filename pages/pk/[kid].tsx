import React from "react";
import Title from "../../components/title";
import { Header } from "../../components/header";
import { GetServerSideProps } from "next";
import connectDB from "../../middlewares/mongoose";
import { sanatizeDB, sanatizeParams } from "../../sanatizeQuery";
import { PublicKey, IPublicKey } from "../../schemas/PublicKey";
import { ThreadList } from "../../components/threadList";
import {
  getThreadsAndReplies,
  ThreadWithReplys,
} from "../../query/getThreadsAndReplies";
import LoggingFactory from "../../middlewares/logging";

interface PKPageProps {
  publicKey: IPublicKey;
  threads: ThreadWithReplys;
  more: boolean;
  startPage: number;
}

const PKPage: React.FC<PKPageProps> = (props) => {
  return (
    <div>
      <Title newThreads />
      <Header prefix={`${props.publicKey.owner.name}'s key`} />

      <h2 className={`phone:text-center`}>
        {props.publicKey.owner.name} {"("}
        <a
          href={`mailto:${props.publicKey.owner.email}`}
          target="_blank"
          rel="noreferrer"
        >
          {props.publicKey.owner.email}
        </a>
        {")"}
      </h2>

      {props.publicKey.revoked ? (
        <>
          <h2 className="text-red-600 phone:text-center">
            {"["}REVOKED{"]"}
          </h2>
          <p className="text-red-600 font-bold">
            THE PUBLIC KEY WAS REVOKED BY ITS OWNER. SIGNING POSTS WITH THIS
            PUBLIC KEY IS NO LONGER POSSIBLE.
          </p>
        </>
      ) : null}

      <p>{props.publicKey.owner.comment}</p>

      <pre className="phone:overflow-scroll desktop:w-max border-primary-500 border border-solid phone:p-1 desktop:p-3 bg-gray-800 text-white m-0">
        {props.publicKey.key}
      </pre>
      <a
        className="embedControl"
        href={`https://cirw.in/gpg-decoder/#${encodeURI(props.publicKey.key)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        [Analysis]
      </a>

      <ThreadList
        more={props.more}
        source={`pk/${props.publicKey.keyid}/t`}
        startPage={props.startPage}
        threads={props.threads}
      />
    </div>
  );
};

export default PKPage;

export const getServerSideProps: GetServerSideProps = async ({
  query,
  params,
  req,
  res,
}) => {
  const log = LoggingFactory(req, res, "Public key props");
  await connectDB();
  const page = parseInt(sanatizeParams(query.page, "0"));
  const kid = sanatizeParams(params?.["kid"]);

  log("Collecting threads by", kid, page);

  const pk = await sanatizeDB(PublicKey.findOne({ keyid: kid }));

  if (!pk) {
    log("Could not find public key");
    return {
      notFound: true,
    };
  }

  const { threadsAndReplies, more } = await getThreadsAndReplies(
    { type: "publickey", pk: kid },
    { page }
  );

  log("Collected threads");

  return {
    props: { threads: threadsAndReplies, publicKey: pk, startPage: page, more },
  };
};
