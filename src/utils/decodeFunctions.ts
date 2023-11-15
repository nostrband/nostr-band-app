import { nip19 } from "@nostrband/nostr-tools";

export const noteHexToNoteId = (noteHex: string) => {
  try {
    if (noteHex.startsWith("naddr")) {
      return nip19.decode(noteHex).data;
    }
    return nip19.decode(noteHex).data.toString();
  } catch (e) {
    console.log(e);
    return "";
  }
};
