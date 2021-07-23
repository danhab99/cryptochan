import React from "react";
import * as openpgp from "openpgp";
import Router from "next/router";
import ProgressBar from "@badrap/bar-of-progress";
import "../styles/global.css";

const progress = new ProgressBar({
  size: 2,
  className: "bar-of-progress",
  delay: 100,
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

interface MyAppProps {
  Component: React.FC<any>;
  pageProps: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
  openpgp.config.ignoreTime = true;
  return <Component {...pageProps} />;
}

export default MyApp;
