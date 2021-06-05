import React from "react";
import "../styles/global.css";

interface MyAppProps {
  Component: React.FC<any>;
  pageProps: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
