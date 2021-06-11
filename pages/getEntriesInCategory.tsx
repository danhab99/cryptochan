import { Thread, IThread, IThreadSimple } from "../schemas/Thread";
import { sanatizeDB } from "../sanatizeQuery";

export const PAGE_COUNT = 24;

export interface HomeQueryParmas {
  page: number;
  sort: "bump" | "date";
}

type ThreadWithReply = IThreadSimple & { replyThreads: Array<IThreadSimple> };

export type ThreadWithReplys = Array<ThreadWithReply>;

export async function getEntriesInCategory(
  category: string,
  q: HomeQueryParmas
): Promise<{ entriesAndReplies: ThreadWithReplys; entries: IThread[] }> {
  let entries = (await sanatizeDB(
    Thread.find({
      $or: [{ parenthash: "" }, { parenthash: undefined }],
      ...(category === "all" ? {} : { category }),
    })
      .sort({ published: -1 })
      .skip(q.page * PAGE_COUNT)
      .limit(PAGE_COUNT)
  )) as IThread[];

  let entriesAndReplies: ThreadWithReplys = await Promise.all(
    entries.map(async (entry) => {
      const replyThreads = await sanatizeDB(
        Thread.find({ parenthash: entry.hash.value })
          .sort({ published: -1 })
          .limit(5)
      );
      return {
        ...entry,
        replyThreads,
      };
    })
  );

  return { entriesAndReplies, entries };
}
