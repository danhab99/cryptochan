import React from "react";

interface FormattedBodyProps {
  body: string;
}

const FormattedBody: React.FC<FormattedBodyProps> = (props) => {
  return (
    <div className="entryBody">
      {props.body?.split("\n").map((line) => {
        switch (line[0]) {
          case "#": {
            let c = /^#+/gm.exec(line)?.[0]?.length || 6;
            c = Math.min(6, c);
            return React.createElement(`h${c}`, { className: "entryBody" }, [
              line.slice(c).trim(),
            ]);
          }
          case ">":
            return <p className="text-quote-700">{line}</p>;
          default:
            return <p>{line}</p>;
        }
      })}
    </div>
  );
};

export default FormattedBody;
