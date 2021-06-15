import React from "react";
import Title from "../../components/title";
import { Header } from "../../components/header";

const Keys: React.FC = () => {
  return (
    <div>
      <Title newThreads={false} />
      <Header prefix="Keys" />

      <div className="text-center">
        <a href="/keys/newkeys">
          <h1>Generate Keys</h1>
        </a>
        <a href="/keys/register">
          <h1>Register Keys</h1>
        </a>
        <a href="/keys/revoke">
          <h1>Revoke Keys</h1>
        </a>
      </div>
    </div>
  );
};

export default Keys;
