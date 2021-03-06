import React from "react";
import { Header } from "../components/header";
import Title from "../components/title";
import { Policy } from "../policy";

const Home: React.FC = () => {
  return (
    <div className="home">
      <Header />
      <Title newThreads />

      <div className="centeredFlex">
        <div className="desktop:w-1/2">
          <p className="text-lg text-center">
            Welcome to {process.env.NEXT_PUBLIC_TITLE}!!
          </p>
          <p className="text-center">
            {process.env.NEXT_PUBLIC_TITLE} is a confederated blockchain based
            image board that supports cryptographic signing through PGP. All
            threads are hashed through a standardized protocol allowing them to
            be recognized even when mirrored to other Cryptochan-Compatible
            platforms. Each platform is able to enstate their own policy
            regarding their operations. If you don&apos;t like my rules, then
            screw me! Mirror this blockchain onto your own CCC server and run it
            yourself!
          </p>

          <h2>Rules</h2>
          <ol className="text-center list-inside">
            {Policy.rules.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>

          <div className="entryCard w-full">
            <h2>Categories</h2>

            <div className="px-5">
              {Policy.categories.map((cat, i) => (
                <div key={i}>
                  <p>
                    <a href={`/${cat.name}`} className="embedControl">
                      <span className="text-lg font-bold">{cat.title}</span>
                    </a>
                    : {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
