import { tagType } from "../types/types";

export function getAllTags(array: tagType, tagName: string): tagType {
  const tags: tagType = [];
  for (const item of array) {
    if (item[0] === `${tagName}`) {
      tags.push(item);
    }
  }
  return tags;
}
