import { useEffect, useMemo, useState } from "react";
import cl from "./Profiles.module.css";
import NDK, { NDKEvent } from "@nostrband/ndk";
import Search from "../../../components/Search/Search";
import { useSearchParams } from "react-router-dom";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import { useAppSelector } from "../../../hooks/redux";
import { nip19 } from "@nostrband/nostr-tools";
import { dateToUnix } from "nostr-react";
import { ndkFilter } from "../../../types/types";

const Profiles = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [profilesCount, setProfilesCount] = useState(0);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [profilesIds, setProfilesIds] = useState<string[]>([]);
  const [limitProfiles, setLimitProfiles] = useState(10);
  const [isBottom, setIsBottom] = useState(false);
  const [countFilter, setCountFilter] = useState<ndkFilter>({});
  const search = searchParams.get("q");
  const cleanSearch = useMemo(() => {
    return search
      ?.split(" ")
      .filter((str) =>
        str.includes("following:")
          ? !str.match(/following:npub[0-9a-zA-Z]+/g)
          : !str.match(/by:npub[0-9a-zA-Z]+/g)
      )
      .join(" ")
      .replace(/#[a-zA-Z0-9_]+/g, "")
      .replace(/lang:[a-zA-Z0-9_]+/g, "")
      .replace(/since:\d{4}-\d{2}-\d{2}/g, "")
      .replace(/until:\d{4}-\d{2}-\d{2}/g, "")
      .replace(/kind:\d+/g, "");
  }, [search]);

  const tagsWithHash = search
    ?.split(" ")
    .filter((s) => s.match(/#[a-zA-Z0-9_]+/g)?.toString());
  const tags = tagsWithHash?.map((tag) => tag.replace("#", ""));
  const langsWithPrefix = search
    ?.split(" ")
    .filter((s) => s.match(/lang:[a-zA-Z]+/g)?.toString());
  const langs = langsWithPrefix?.map((lang) => lang.replace("lang:", ""));
  const since = search?.match(/since:\d{4}-\d{2}-\d{2}/)
    ? dateToUnix(
        new Date(
          search?.match(/since:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
        )
      )
    : "";
  const until = search?.match(/until:\d{4}-\d{2}-\d{2}/)
    ? dateToUnix(
        new Date(
          search?.match(/until:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
        )
      )
    : "";

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollBottom = scrollTop + windowHeight;
    if (scrollBottom >= documentHeight) {
      setIsBottom(true);
    } else {
      setIsBottom(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMoreProfiles = () => {
    setLimitProfiles((prevState) => prevState + 10);
  };

  useEffect(() => {
    if (isBottom) {
      if (profilesCount - profiles.length && !isLoadingProfiles) {
        getMoreProfiles();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  // useLayoutEffect(() => {
  // fetchProfilesCount();
  // }, []);

  useEffect(() => {
    fetchProfilesCount(countFilter);
  }, [countFilter]);

  useEffect(() => {
    if (ndk instanceof NDK) {
      fetchProfilesIds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const fetchProfilesIds = async () => {
    if (ndk instanceof NDK) {
      const filter = { kinds: [0], limit: 200 };
      if (cleanSearch?.trim()) {
        Object.defineProperty(filter, "search", {
          value: cleanSearch.trimStart().trimEnd(),
          enumerable: true,
        });
      }

      if (tags?.length) {
        Object.defineProperty(filter, "#t", {
          value: tags,
          enumerable: true,
        });
      }

      if (since) {
        Object.defineProperty(filter, "since", {
          value: since,
          enumerable: true,
        });
        if (!until) {
          Object.defineProperty(filter, "until", {
            value: dateToUnix(new Date()),
            enumerable: true,
          });
        }
      }

      if (until) {
        Object.defineProperty(filter, "until", {
          value: until,
          enumerable: true,
        });
      }

      if (langs?.length) {
        Object.defineProperty(filter, "@lang", {
          value: langs,
          enumerable: true,
        });
      }

      if (search?.includes("following:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";
        //@ts-ignore
        const userContacts = await ndk.fetchEvent({
          kinds: [3],
          authors: [userPk],
        });
        const followingPubkeys = userContacts
          ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
          : [];

        if (followingPubkeys.length) {
          Object.defineProperty(filter, "authors", {
            value: followingPubkeys,
            enumerable: true,
          });
        }

        console.log("postsFilter", filter);

        const profilesIds = await ndk.fetchTop(filter);
        const countFilter = { ...filter, limit: 10000 };
        setCountFilter(countFilter);
        setProfilesIds(profilesIds?.ids ?? []);
        getProfiles(profilesIds?.ids ?? []);
      } else if (search?.includes("by:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";
        if (userPk) {
          Object.defineProperty(filter, "authors", {
            value: [userPk],
            enumerable: true,
          });
        }
        const profilesIds = await ndk.fetchTop(filter);
        setProfilesIds(profilesIds?.ids ?? []);
        getProfiles(profilesIds?.ids ?? []);
        setProfilesCount(1);
      } else {
        const topProfilesIds = await ndk.fetchTop(filter);
        console.log("postsFilter", filter);
        setProfilesIds(topProfilesIds?.ids ?? []);
        getProfiles(topProfilesIds?.ids ?? []);
        const countFilter = { ...filter, limit: 10000 };
        setCountFilter(countFilter);
      }
    }
  };

  const fetchProfilesCount = async (filter: ndkFilter) => {
    try {
      const search = searchParams.get("q");
      if (search?.includes("following:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";
        //@ts-ignore
        const userContacts = await ndk.fetchEvent({
          kinds: [3],
          authors: [userPk],
        });

        const countProfiles = await ndk.fetchCount(filter);
        setProfilesCount(countProfiles?.count ?? 0);
      } else if (search?.includes("by:")) {
        setProfilesCount(1);
      } else {
        console.log(filter);

        const profilesCount = await ndk.fetchCount(filter);
        setProfilesCount(profilesCount?.count ?? 0);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (ndk instanceof NDK) {
      getProfiles(profilesIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitProfiles]);

  function compareByKeys(a: NDKEvent, b: NDKEvent, ids: string | any[]) {
    return ids.indexOf(a.id) - ids.indexOf(b.id);
  }

  const getProfiles = async (ids: string[]) => {
    try {
      if (ndk instanceof NDK) {
        setIsLoadingProfiles(true);
        const profiles = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            ids: ids.slice(0, limitProfiles),
          })
        );
        const sortedContentArray = profiles
          .slice()
          .sort((a, b) => compareByKeys(a, b, ids));

        setProfiles(sortedContentArray);
        // fetchProfilesCount();
      }
      setIsLoadingProfiles(false);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={cl.profiles}>
      <Search isLoading={isLoadingProfiles} />
      <h2 className={cl.prTitle}>
        Profiles <br />
        <span>
          found {profilesCount} {profilesCount > 1 ? "profiles" : "profile"}
        </span>
      </h2>
      {profiles?.length ? (
        <div className={cl.resultProfiles}>
          {profiles.map((profile) => {
            const profileContent = JSON.parse(profile.content);
            return (
              <ProfileItem
                img={profileContent.picture}
                pubKey={profile.pubkey}
                bio={profileContent.about}
                name={
                  profileContent.display_name
                    ? profileContent.display_name
                    : profileContent.name
                }
                key={profile.id}
                mail={profileContent.nip05}
                newFollowersCount={0}
              />
            );
          })}
        </div>
      ) : (
        "No profiles"
      )}
      {isLoadingProfiles && <p>Loading...</p>}
      <p style={{ color: "var(--body-color)" }}>
        {profilesIds.length - profiles.length === 0 && profiles.length !== 200
          ? `End of results (${
              profilesCount - profiles.length
            } profiles in spam)`
          : ""}
      </p>
      <p>{profiles.length >= 200 ? "We only show top 200 results" : ""}</p>
    </div>
  );
};

export default Profiles;
