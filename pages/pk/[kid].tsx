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

interface PKPageProps {
  publicKey: IPublicKey;
  threads: ThreadWithReplys;
  more: boolean;
  startPage: number;
}

const PKPage: React.FC<PKPageProps> = (props) => {
  return (
    <div>
      <Title newThreads={false} />
      <Header prefix={`${props.publicKey.owner.name}'s key`} />

      <h2 className={`phone:text-center`}>
        {props.publicKey.owner.name} {"("}
        <a href={`mailto:${props.publicKey.owner.email}`}>
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
            THE PUBLIC KEY WAS REVOKED ITS OWNER. SIGNING POSTS WITH THIS PUBLIC
            KEY IS NO LONGER POSSIBLE.
          </p>
        </>
      ) : null}

      <p>{props.publicKey.owner.comment}</p>

      <pre className="phone:overflow-scroll desktop:w-max border-primary-500 border border-solid phone:p-1 desktop:p-3 bg-gray-800 text-white">
        {props.publicKey.key}
      </pre>

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
}) => {
  await connectDB();
  const page = parseInt(sanatizeParams(query.page, "0"));
  const kid = sanatizeParams(params?.["kid"]);

  const pk = await sanatizeDB(PublicKey.findOne({ keyid: kid }));

  debugger;

  if (!pk) {
    return {
      notFound: true,
    };
  }

  const { threadsAndReplies, more } = await getThreadsAndReplies(
    { type: "publickey", pk: kid },
    { page }
  );

  return {
    props: { threads: threadsAndReplies, publicKey: pk, startPage: page, more },
  };
};
