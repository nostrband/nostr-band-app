import { contentType } from "../types/types";
import { collectLinksFromStr, defineTypeLink } from "./formatLink";

export const formatContent = (about: string) => {
  let contents: contentType[] = [];
  if (about) {
    const links = collectLinksFromStr(about);

    contents = links
      .map((link: string) => {
        const links: contentType[] = [];
        const obj = defineTypeLink(link);
        if (obj) {
          if (obj.type !== "NotMedia" && obj.type) {
            links.push(obj);
          }
        }
        return links ? links : [];
      })
      .flat();
  }
  return contents;
};
