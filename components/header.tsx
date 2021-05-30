import React from "react";
import Head from "next/head";

type HeaderProps = { entry: any } | { category: any } | { user: any };

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <Head>
      <title>{process.env.TITLE}</title>
    </Head>
  );
};
