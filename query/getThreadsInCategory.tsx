import { Thread, IThread, IThreadSimple } from "../schemas/Thread";
import { sanatizeDB } from "../sanatizeQuery";

export const PAGE_COUNT = 24;

export interface HomeQueryParmas {
  page: number;
  sort: string;
}

type ThreadWithReply = IThreadSimple & { replyThreads: Array<IThreadSimple> };

export type ThreadWithReplys = Array<ThreadWithReply>;

export async function getThreadsInCategory(
  category: string,
  q: HomeQueryParmas
): Promise<{ threadsAndReplies: ThreadWithReplys; threads: IThread[] }> {
  let threads = (await sanatizeDB(
    Thread.find({
      $or: [{ parenthash: "" }, { parenthash: undefined }],
      ...(category === "all" ? {} : { category }),
    })
      .sort({ published: -1 })
      .skip(q.page * PAGE_COUNT)
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

  return { threadsAndReplies, threads };
}
