import React from "react";
import Head from "next/head";

interface HeaderProps {
  prefix?: string;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <Head>
      <title>
        {props.prefix}
        {props.prefix ? " - " : ""}
        {process.env.NEXT_PUBLIC_TITLE}
      </title>
    </Head>
  );
};
