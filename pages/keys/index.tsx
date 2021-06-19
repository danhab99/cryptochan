import React from "react";
import Title from "../../components/title";
import { Header } from "../../components/header";
import { Link } from "next/link";

const Keys: React.FC = () => {
  return (
    <div>
      <Title newThreads={false} />
      <Header prefix="Keys" />

      <div className="text-center">
        <Link href="/keys/newkeys">
          <a>
            <h1>Generate Keys</h1>
          </a>
        </Link>
        <Link href="/keys/register">
          <a>
            <h1>Register Keys</h1>
          </a>
        </Link>
        <Link href="/keys/revoke">
          <a>
            <h1>Revoke Keys</h1>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Keys;
