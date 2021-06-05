import React from "react";
import { IEntry } from "../schemas/Entry";

interface EntryProps {
  entry: IEntry;
}

const EntryComponent: React.FC<EntryProps> = ({ entry }) => {
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

export default EntryComponent;
