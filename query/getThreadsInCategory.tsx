import { Thread, IThread, IThreadSimple } from "../schemas/Thread";
import { sanatizeDB } from "../sanatizeQuery";
import { FilterQuery } from "mongoose";

export const PAGE_COUNT = 24;

export type ThreadsQuery =
  | { type: "category"; category?: string }
  | { type: "replies"; parent: string }
  | { type: "publickey"; pk: string };

export interface HomeQueryParmas {
  page: number;
  sort: string;
}

type ThreadWithReply = IThreadSimple & { replyThreads: Array<IThreadSimple> };

export type ThreadWithReplys = Array<ThreadWithReply>;

export async function getThreadsInCategory(
  query: ThreadsQuery,
  params: HomeQueryParmas
): Promise<{ threadsAndReplies: ThreadWithReplys; more: boolean }> {
  let queryObj: FilterQuery<IThread>;

  switch (query.type) {
    case "category":
      queryObj = {
        $or: [{ parenthash: "" }, { parenthash: undefined }],
        ...(query.category === "all" ? {} : { category: query.category }),
      };
      break;

    case "replies":
      queryObj = { "hash.value": query.parent };
      break;

    case "publickey":
      queryObj = { "author.publickey": query.pk };
      break;

    default:
      throw new Error("Query required");
  }

  let threads = (await sanatizeDB(
    Thread.find(queryObj)
      .sort({ published: -1 })
      .skip(params.page * PAGE_COUNT)
      .limit(PAGE_COUNT)
  )) as IThread[];

  let threadsAndReplies: ThreadWithReplys = await Promise.all(
    threads.map(async (thread) => {
      const replyThreads = await sanatizeDB(
        Thread.find({ parenthash: thread.hash.value })
          .sort({ published: -1 })
          .limit(5)
      );
      return {
        ...thread,
        replyThreads,
      };
    })
  );

  return { threadsAndReplies, more: threads.length >= PAGE_COUNT };
}
