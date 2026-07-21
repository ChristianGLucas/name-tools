// Ambient type declaration for parse-full-name (MIT), which ships no types
// of its own and has no @types package. Signature verified against the
// installed package's index.js (exports.parseFullName), pinned at 1.2.7 in
// package.json.
declare module 'parse-full-name' {
  export interface RawParsedName {
    title: string;
    first: string;
    middle: string;
    last: string;
    nick: string;
    suffix: string;
    error: string[];
  }

  /**
   * @param nameToParse - The full name string, any order/format.
   * @param partToReturn - 'all' (default) returns the full object; a single
   *   part name returns just that string. We always pass undefined ('all').
   * @param fixCase - true: always case-fix; undefined: auto-detect (fix only
   *   if input is all-upper or all-lower); false: never fix.
   * @param stopOnError - true: throw on the first parse ambiguity; false
   *   (what we always pass): collect ambiguities into the returned `error`
   *   array instead, and still return a best-effort parse.
   * @param useLongLists - true: extended prefix/suffix/title catalogs.
   */
  export function parseFullName(
    nameToParse: string,
    partToReturn?: string,
    fixCase?: boolean,
    stopOnError?: boolean,
    useLongLists?: boolean
  ): RawParsedName;
}
