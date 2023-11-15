import { nip19 } from "nostr-tools";

export const isNaddr = (
  hex: string | nip19.AddressPointer | nip19.EventPointer | nip19.ProfilePointer
): hex is nip19.AddressPointer => {
  return (hex as nip19.AddressPointer).identifier !== undefined;
};
