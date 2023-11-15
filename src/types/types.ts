import { NDKTag } from "@nostrband/ndk";

export type tagType = NDKTag[];
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
      pubkey?: string;
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
      image?: string;
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
  pub_reaction_ref_event_count?: number;
  pub_long_note_count?: number;
  pub_bookmark_ref_event_count?: number;
  pub_note_ref_event_count?: number;
  pub_note_ref_pubkey_count?: number;
  pub_repost_ref_event_count?: number;
  pub_repost_ref_pubkey_count?: number;
  pub_post_count?: number;
  pub_reply_count?: number;
  pub_reaction_count?: number;
  pub_reaction_ref_pubkey_count?: number;
  pub_report_count?: number;
  pub_report_ref_event_count?: number;
  pub_report_ref_pubkey_count?: number;
  report_count?: number;
  report_pubkey_count?: number;
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

export type nostrApiType = {
  id: string;
  pubkey: string;
  relays: string[];
  author: {
    content: string;
    created_at: number;
    id: string;
    kind: number;
    pubkey: string;
    sig: string;
    tags: tagType;
  };
  event: {
    content: string;
    created_at: number;
    id: string;
    kind: number;
    pubkey: string;
    sig: string;
    tags: tagType;
  };
};

export type nostrPeopleType = {
  new_followers_count: number;
  pubkey: string;
  relays: string[];
  profile: {
    content: string;
    created_at: number;
    id: string;
    kind: number;
    pubkey: string;
    sig: string;
    tags: tagType;
  };
};

export type contentType = { type: string; url: string };

export type ndkFilter = {
  kinds?: number[];
  authors?: string[];
  pubkey?: string[];
  "#e"?: string[];
  "#t"?: string[];
  "#d"?: string[];
  limit?: number;
  since?: number;
  until?: number;
};
