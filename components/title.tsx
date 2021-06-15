import React, { useState } from "react";
import ThreadForm from "./threadform";
import { Policy } from "../policy";
import useCryptoAvaliable from "./useCryptoAvaliable";

interface TitleProps {
  newThreads: boolean;
}

const Title: React.FC<TitleProps> = (props) => {
  const [showForm, setShowForm] = useState(false);
  const hasCrypto = useCryptoAvaliable();

  return (
    <div>
      <div className="categories">
        <p>{"["}</p>
        {Policy.categories.map((cat) => (
          <a href={`/${cat.name}`}>/{cat.name}/</a>
        ))}
        <p>{"]"}</p>

        <p>{"["}</p>
        <a href="/keys/newkeys">Generate</a>
        <a href="/keys/register">Register</a>
        <a href="/keys/revoke">Revoke</a>
        <p>{"]"}</p>
      </div>
      <header>
        <h1 className="text-primary-600 desktop:text-8xl tablet:text-7xl phone:text-5xl">
          {process.env.NEXT_PUBLIC_TITLE}
        </h1>

        {!hasCrypto ? (
          <h1 className="text-red-800">
            Your browser does not support{" "}
            <a
              className="text-red-800"
              href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API#browser_compatibility"
            >
              WebCrypto
            </a>
            , you will be unable to submit or verify threads.
          </h1>
        ) : null}

        {props.newThreads && hasCrypto ? (
          <div className="newthread">
            <button onClick={() => setShowForm((x) => !x)}>
              Start a new thread
            </button>
            {showForm ? (
              <div>
                <ThreadForm />
              </div>
            ) : null}
          </div>
        ) : null}
      </header>
    </div>
  );
};

export default Title;
