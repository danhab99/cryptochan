import React, { useState } from "react";
import ThreadForm from "./threadform";

interface TitleProps {}

const Title: React.FC<TitleProps> = (props) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <header>
        <h1 className="text-primary-600">{process.env.TITLE}</h1>

        <div>
          <button onClick={() => setShowForm(true)}>Start a new thread</button>
          {showForm ? (
            <div>
              <ThreadForm />
            </div>
          ) : null}
        </div>
      </header>
    </div>
  );
};

export default Title;
