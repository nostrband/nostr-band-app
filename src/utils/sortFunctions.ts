import { NDKEvent } from "@nostrband/ndk";
import { getAllTags } from "./getTags";

export function compareByTagName(a: NDKEvent, b: NDKEvent) {
  const tagA = a.tags.find((tag) => tag[0] === "d")![1].toLowerCase();
  const tagB = b.tags.find((tag) => tag[0] === "d")![1].toLowerCase();

  if (tagA < tagB) {
    return -1;
  }
  if (tagA > tagB) {
    return 1;
  }
  return 0;
}
