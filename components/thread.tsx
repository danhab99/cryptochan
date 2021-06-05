import React from "react";
import { IThread } from "../schemas/Thread";

interface ThreadProps {
  entry: IThread;
}

const ThreadComponent: React.FC<ThreadProps> = ({ entry }) => {
  return (
    <div className="entryCard">
      <p className="entryTitle">
        <span className="font-bold">{entry.author.name}</span> (pk:
        {entry.author.publickey}) {entry.published.toISOString()}
        <span className="text-muted-600">
          {"#"}
          {entry.hash.value}
        </span>
      </p>

      <p className="text-md">{entry.body.content}</p>
    </div>
  );
};

export default ThreadComponent;
