import { nip19 } from "@nostrband/nostr-tools";

export const noteHexToNoteId = (noteHex: string): string => {
  try {
    return nip19.decode(noteHex).data.toString();
  } catch (e) {
    console.log(e);
    return "";
  }
};
