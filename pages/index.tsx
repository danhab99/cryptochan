import { GetServerSideProps } from "next";
import React from "react";
import { Header } from "../components/header";
import _ from "lodash";
import { Entry, IEntry } from "../schemas/Entry";
import connectDB from "../middlewares/mongoose";
import Title from "../components/title";
import EntryComponent from "../components/entry";

type HomeProps = { entries?: IEntry[]; error?: Error };

interface HomeQueryParmas {
  page: number;
  sort: "bump" | "date";
}

const Home: React.FC<HomeProps> = (props) => {
  return (
    <div>
      <Header type="category" category="all" />
      <Title newThreads />

      {props.entries?.map((entry) => (
        <EntryComponent entry={entry} />
      ))}
    </div>
  );
};

export default Home;

const PAGE_COUNT = 24;

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  query,
}) => {
  await connectDB();
  let q: HomeQueryParmas = query;

  _.defaults(q, {
    page: 0,
    sort: "date",
  });

  try {
    let entries = (await Entry.find({ parenthash: "" })
      .sort({ published: 1 })
      .skip(q.page * PAGE_COUNT)
      .limit(PAGE_COUNT)
      .select({
        _id: false,
        embeds: {
          _id: false,
        },
      })
      .lean()) as IEntry[];

    return {
      props: {
        entries,
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
