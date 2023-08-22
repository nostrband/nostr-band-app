export type tagType = Array<[string, string]>;

export type ndkEventType = {
  content?: string;
  created_at?: number;
  id?: string;
  kind?: number;
  pubkey?: string;
  tags: tagType;
};

export type profileType =
  | {
      npub: string;
      name?: string | undefined;
      username?: string | undefined;
      display_name?: string | undefined;
      picture?: string | undefined;
      banner?: string | undefined;
      about?: string | undefined;
      website?: string | undefined;
      lud06?: string | undefined;
      lud16?: string | undefined;
      nip05?: string | undefined;
    }
  | undefined;
