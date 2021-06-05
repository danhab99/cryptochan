import React from "react";
import Title from "../components/title";
import { Header } from "../components/header";

const Error404Page: React.FC = () => {
  return (
    <div>
      <Title newThreads={false} />
      <Header error="page not found" type="error" />

      <header>
        <h1 className="text-6xl">404 Page not found</h1>
      </header>
    </div>
  );
};

export default Error404Page;
