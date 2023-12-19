function openAppManager(id: string, select?: boolean) {
  window.open(
    "https://nostrapp.link/#" + id + (select ? "?select=true" : ""),
    "_blank"
  );
}

export function openNostrBand() {
  const is_new = !localStorage.getItem("u");
  localStorage.setItem("u", "1");

  if ("plausible" in window) {
    //@ts-ignore
    window.plausible("pageview", {
      props: { n: is_new ? 1 : 0, l: localStorage.getItem("login") ? 1 : 0 },
    });
  }
}

export function openNostrEvent(
  e: React.MouseEvent,
  EventId: string,
  select?: boolean
) {
  e.preventDefault();
  const is_new = !localStorage.getItem("u");
  if ("plausible" in window) {
    //@ts-ignore
    window.plausible("OpenApp", {
      props: {
        n: is_new ? 1 : 0,
        l: localStorage.getItem("login") ? 1 : 0,
        select: select ? "1" : "0",
      },
    });
  }

  openAppManager(EventId, select);
  return false;
}

export function openNostrProfile(
  e: React.MouseEvent,
  npub: string,
  select?: boolean
) {
  e.preventDefault();
  const is_new = !localStorage.getItem("u");
  if ("plausible" in window) {
    //@ts-ignore
    window.plausible("OpenApp", {
      props: {
        n: is_new ? 1 : 0,
        l: localStorage.getItem("login") ? 1 : 0,
        select: select ? "1" : "0",
      },
    });
  }

  openAppManager(npub, select);
  return false;
}

export const getKindNumber = (str: string) => {
  switch (str) {
    case "Profiles":
      return 0;
    case "Posts":
      return 1;
    case "Zaps":
      return 9735;
  }
  return null;
};

export const getKindName = (number: number) => {
  switch (number) {
    case 0:
      return "Metadata";
    case 1:
      return "Short Text Note";
    case 2:
      return "Recommend Relay";
    case 3:
      return "Follows";
    case 4:
      return "Encrypted Direct Messages";
    case 5:
      return "Event Deletion";
    case 6:
      return "Repost";
    case 7:
      return "Reaction";
    case 8:
      return "Badge Award";
    case 16:
      return "Generic Repost";
    case 40:
      return "Channel Creation";
    case 41:
      return "Channel Metadata";
    case 42:
      return "Channel Message";
    case 43:
      return "Channel Hide Message";
    case 44:
      return "Channel Mute User";
    case 1040:
      return "OpenTimestamps";
    case 1063:
      return "File Metadata";
    case 1311:
      return "Live Chat Message";
    case 1971:
      return "Problem Tracker";
    case 1984:
      return "Reporting";
    case 1985:
      return "Label";
    case 4550:
      return "Community Post Approval";
    case 5000:
      return "Job Request";
    case 6000:
      return "Job Result";
    case 7000:
      return "Job Feedback";
    case 9041:
      return "Zap Goal";
    case 9735:
      return "Zap";
    case 9802:
      return "Highlights";
    case 10000:
      return "Mute list";
    case 10001:
      return "Pin list";
    case 10002:
      return "Relay List Metadata";
    case 10003:
      return "Bookmark list";
    case 10004:
      return "Communities list";
    case 10005:
      return "Public chats list";
    case 10006:
      return "Blocked relays list";
    case 10007:
      return "Search relays list";
    case 10015:
      return "Interests list";
    case 10030:
      return "User emoji list";
    case 13194:
      return "Wallet Info";
    case 30000:
      return "Follow sets";
    case 30001:
      return "Generic lists";
    case 30002:
      return "Relay sets";
    case 30003:
      return "Bookmark sets";
    case 30004:
      return "Curation sets";
    case 30008:
      return "Profile Badges";
    case 30009:
      return "Badge Definition";
    case 30015:
      return "Interest sets";
    case 30017:
      return "Create or update a stall";
    case 30018:
      return "Create or update a product";
    case 30023:
      return "Long-form Content";
    case 30024:
      return "Draft Long-form Content";
    case 30030:
      return "Emoji sets";
    case 30078:
      return "Application-specific Data";
    case 30311:
      return "Live Event";
    case 30315:
      return "User Statuses";
    case 30402:
      return "Classified Listing";
    case 30403:
      return "Draft Classified Listing";
    case 31922:
      return "Date-Based Calendar Event";
    case 31923:
      return "Time-Based Calendar Event";
    case 31924:
      return "Calendar";
    case 31925:
      return "Calendar Event RSVP";
    case 31989:
      return "Handler recommendation";
    case 31990:
      return "Handler information";
    case 34550:
      return "Community Definition";
    default:
      return number.toString();
  }
};
