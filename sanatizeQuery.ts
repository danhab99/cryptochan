import { Query, Document } from "mongoose";

export default async function sanatize<
  ResultType,
  DocType extends Document<any, any>,
  THelpers = {}
>(query: Query<ResultType, DocType, THelpers>): Promise<ResultType> {
  return (await query
    .select({
      _id: false,
      embeds: {
        _id: false,
      },
    })
    .lean()) as ResultType;
}
