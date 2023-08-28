export type tagType = Array<[string, string]> | [];
export type ndkEventType = {
  content?: string;
  created_at?: number;
  id?: string;
  kind?: number;
  pubkey?: string;
  tags?: tagType;
};

export type profileType =
  | {
      content?: string;
      npub?: string;
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
      tags?: tagType;
    }
  | undefined;

export type statsType = {
  followers_pubkey_count?: number;
  pub_following_pubkey_count?: number;
  event_id?: string;
  reaction_count?: number;
  reaction_pubkey_count?: number;
  reply_count?: number;
  reply_pubkey_count?: number;
  repost_count?: number;
  repost_pubkey_count?: number;
  zaps?: {
    avg_msats?: number;
    count?: number;
    max_msats?: number;
    median_msats?: number;
    min_msats?: number;
    msats?: number;
    provider_count?: number;
    target_event_count?: number;
    target_pubkey_count?: number;
    zapper_count?: number;
  };
  zaps_received?: {
    avg_msats?: number;
    count?: number;
    max_msats?: number;
    median_msats?: number;
    min_msats?: number;
    msats?: number;
    provider_count?: number;
    target_event_count?: number;
    target_pubkey_count?: number;
    zapper_count?: number;
  };
  zaps_sent?: {
    avg_msats?: number;
    count?: number;
    max_msats?: number;
    median_msats?: number;
    min_msats?: number;
    msats?: number;
    provider_count?: number;
    target_event_count?: number;
    target_pubkey_count?: number;
    zapper_count?: number;
  };
};
