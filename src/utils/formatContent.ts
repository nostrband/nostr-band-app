import { NDKEvent } from "@nostrband/ndk";
import { contentType } from "../types/types";
import {
  collectLinksFromStr,
  defineTypeLink,
  extractNostrStrings,
  replaceNostrLinks,
} from "./formatLink";
import { nip19 } from "@nostrband/nostr-tools";

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

export const formatNostrContent = (
  content: string,
  taggedProfiles: (NDKEvent | string)[]
): string => {
  try {
    const contentLinks = content ? extractNostrStrings(content) : [];
    let newContent = content;

    if (content && taggedProfiles && contentLinks.length) {
      contentLinks.map((link) => {
        if (link.startsWith("npub")) {
          const pk = nip19.decode(link).data;
          const findUser = taggedProfiles.find((profile) => {
            if (profile instanceof NDKEvent) {
              return profile.pubkey === pk;
            }
          });
          if (findUser instanceof NDKEvent) {
            const profileContent = JSON.parse(findUser.content);
            const npub = nip19.npubEncode(findUser.pubkey);
            newContent = replaceNostrLinks(
              newContent,
              profileContent?.display_name
                ? `@${profileContent?.display_name}`
                : `@${profileContent?.name}`,
              `nostr:${npub}`
            );
          } else {
            newContent = replaceNostrLinks(
              newContent,
              `${link.toString().slice(0, 12)}...${link.toString().slice(-4)}`,
              `nostr:${link}`
            );
          }
        } else {
          newContent = replaceNostrLinks(
            newContent,
            `${link.toString().slice(0, 10)}...${link.toString().slice(-4)}`,
            `nostr:${link}`
          );
        }
      });
      return newContent;
    }
    return content;
  } catch (e) {
    console.log(e);
    return content;
  }
};
