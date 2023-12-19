import { NDKTag } from "@nostrband/ndk";
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

export function getRootTag(array: tagType): string {
  if (array.length === 1 && !array[0].includes("mention")) {
    return array[0][1];
  }
  for (const tag of array) {
    if (tag.includes("root")) {
      return tag[1];
    } else if (!tag.includes("reply") && !tag.includes("mention")) {
      return tag[1];
    }
  }
  return "";
}

export function getReplyTag(array: tagType): string {
  const findReply = array.find((tag) => tag[3] === "reply");
  const rootId = getRootTag(array);

  if (findReply && array.length >= 2) {
    return findReply[1];
  } else {
    for (const tag of array) {
      if (tag.includes("reply") && array.length >= 2) {
        return tag[1];
      } else if (array.length >= 2 && tag[1] !== rootId) {
        return tag[1];
      }
    }
  }
  return "";
}

export function getTag(array: tagType, tagNames: string[]): string {
  for (const item of array) {
    if (tagNames.includes(item[0])) {
      return item[1];
    }
  }
  return "";
}
