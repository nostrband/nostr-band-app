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
