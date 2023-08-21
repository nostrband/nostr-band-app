export type tagType = Array<[string, string]>;

export type ndkEventType = {
  content?: string;
  created_at?: number;
  id?: string;
  kind?: number;
  pubkey?: string;
  tags: tagType;
};
