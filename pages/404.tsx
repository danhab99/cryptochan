import React, { useState, useEffect } from "react";
import Title from "../components/title";
import { Header } from "../components/header";

const Error404Page: React.FC = () => {
  const [message, setMessage] = useState("404 Page not found");

  useEffect(() => {
    let s = window.location.pathname.split("/");
    switch (s[1]) {
      case "t":
        setMessage("Thread not found or awaiting approval");
        break;
      case "pk":
        setMessage("Public key not found");
        break;
    }
  }, []);

  return (
    <div>
      <Title newThreads={false} />
      <Header prefix="404" />

      <header>
        <h1 className="text-6xl">{message}</h1>
      </header>
    </div>
  );
};

export default Error404Page;
