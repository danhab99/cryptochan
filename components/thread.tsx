import React, { useState } from "react";
import { IThread } from "../schemas/Thread";
import SigValidator from "./sigvalidator";

interface ThreadProps {
  entry: IThread;
}

const ThreadComponent: React.FC<ThreadProps> = ({ entry }) => {
  const [embedPage, setEmbedPage] = useState(0);

  const currentEmbed = entry.embeds[embedPage] || {};
  const currentEmbedSource = `/api/e/${currentEmbed?.hash}`;

  return (
    <div className="entryCard flex flex-row w-max p-2">
      <div className="m-4">
        {(() => {
          if (Object.keys(currentEmbed).length > 0) {
            switch (currentEmbed.mimetype.split("/")[0]) {
              case "image":
                return (
                  <img
                    src={currentEmbedSource}
                    className="embed"
                    onClick={() => window.open(currentEmbedSource)}
                  />
                );

              case "video":
                return (
                  <video src={currentEmbedSource} className="embed" controls />
                );

              default:
                return (
                  <div className="embed aspect-w-1">
                    <h4>{currentEmbed?.mimetype}</h4>
                    <a href={currentEmbedSource}>Open</a>
                  </div>
                );
            }
          } else {
            return <div></div>;
          }
        })()}

        <div className="flex flex-row justify-between pr-1 pl-1 ">
          {entry.embeds.length > 1 ? (
            <p
              className="embedControl"
              onClick={() =>
                setEmbedPage((x) => (x === 0 ? entry.embeds.length - 1 : x - 1))
              }
            >
              {"<<<"}
            </p>
          ) : null}
          {entry.url ? (
            <a className="embedControl" href={entry.url}>
              [Link]
            </a>
          ) : null}
          {entry.embeds.length > 1 ? (
            <a
              className="embedControl"
              onClick={() =>
                setEmbedPage((x) => (x === entry.embeds.length - 1 ? 0 : x + 1))
              }
            >
              {">>>"}
            </a>
          ) : null}
        </div>
      </div>
      <div>
        <p className="entryTitle">
          <span className="font-bold">{entry.author.name}</span>{" "}
          <a href={`/api/pk/${entry.author.publickey}`}>
            <span>
              (pk:
              {entry.author.publickey})
            </span>
          </a>{" "}
          {entry.published.toISOString()}
          <SigValidator thread={entry} />
          <br />
          <span className="text-muted-600">
            {"#"}
            {entry.hash.value}
          </span>
        </p>

        <div className="flex flex-row mt-2">
          <a className="embedControl" href={`/t/${entry.hash.value}`}>
            [View Thread]
          </a>
          &nbsp;
          <a className="embedControl">[Reply]</a>
        </div>

        <p className="text-sm font-mono text-black">{entry.body.content}</p>
      </div>
    </div>
  );
};

export default ThreadComponent;
