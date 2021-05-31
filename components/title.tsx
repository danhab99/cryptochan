import React from "react";

interface TitleProps {}

const Title: React.FC<TitleProps> = (props) => {
  return (
    <div>
      <header>
        <h1>{process.env.TITLE}</h1>
      </header>
    </div>
  );
};

export default Title;
