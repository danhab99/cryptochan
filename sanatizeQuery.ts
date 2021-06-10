import { Query, Document } from "mongoose";

export class ParamNotFoundError extends Error {}

export async function sanatizeDB<
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

export function sanatizeParams(
  param: string | string[] | undefined,
  def?: string
): string {
  if (param) {
    if (Array.isArray(param)) {
      return param[0];
    } else {
      return param;
    }
  } else {
    if (def) {
      return def;
    } else {
      throw new ParamNotFoundError();
    }
  }
}
