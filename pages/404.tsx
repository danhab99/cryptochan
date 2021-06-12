import React from "react";
import Title from "../components/title";
import { Header } from "../components/header";
import { useRouter } from "next/router";

interface ErrorProps {
  kind: "category" | "thread";
}

const Error404Page: React.FC = () => {
  const router = useRouter();
  console.log(router);
  return (
    <div>
      <Title newThreads={false} />
      <Header prefix="404" />

      <header>
        <h1 className="text-6xl">404 Page not found</h1>
      </header>
    </div>
  );
};

export default Error404Page;
