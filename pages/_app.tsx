import React from "react";
import * as openpgp from "openpgp";
import "../styles/global.css";

interface MyAppProps {
  Component: React.FC<any>;
  pageProps: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
  openpgp.config.ignoreTime = true;
  return <Component {...pageProps} />;
}

export default MyApp;
