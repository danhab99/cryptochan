import React from "react";
import Head from "next/head";
import { IThreadSimple } from "../schemas/Thread";

type HeaderProps =
  | { type: "entry"; entry: IThreadSimple }
  | { type: "category"; category: string }
  | { type: "user"; user: any }
  | { type: "error"; error: string }
  | { type: "nothing" };

const PrefixMap: Record<HeaderProps["type"], string> = {
  category: "Category",
  entry: "Thread",
  error: "Error",
  user: "Public key",
  nothing: "",
};

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <Head>
      <title>
        {PrefixMap[props.type]} {props.type === "error" ? props.error : null}{" "}
        {props.type !== "nothing" ? "-" : ""} {process.env.TITLE}
      </title>
    </Head>
  );
};
