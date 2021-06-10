import React, { useState } from "react";
import ThreadForm from "./threadform";
import { Policy } from "../policy";

interface TitleProps {
  newThreads: boolean;
}

const Title: React.FC<TitleProps> = (props) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="categories">
        <p>{"["}</p>
        {Policy.categories.map((cat) => (
          <a href={`/${cat.name}`}>/{cat.name}/</a>
        ))}
        <p>{"]"}</p>
      </div>
      <header>
        <h1 className="text-primary-600 text-8xl">{process.env.TITLE}</h1>

        {props.newThreads ? (
          <div className="newthread">
            <button onClick={() => setShowForm(true)}>
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
