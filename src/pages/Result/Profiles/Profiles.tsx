import { useEffect, useLayoutEffect, useState } from "react";
import cl from "./Profiles.module.css";
import NDK, { NDKEvent } from "@nostrband/ndk";
import Search from "../../../components/Search/Search";
import { useSearchParams } from "react-router-dom";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import { useAppSelector } from "../../../hooks/redux";

const Profiles = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [profilesCount, setProfilesCount] = useState(0);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [profilesIds, setProfilesIds] = useState<string[]>([]);
  const [limitProfiles, setLimitProfiles] = useState(10);
  const [isBottom, setIsBottom] = useState(false);

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

  useLayoutEffect(() => {
    fetchProfilesCount();
  }, []);

  useEffect(() => {
    if (ndk instanceof NDK) {
      fetchProfilesIds(ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const fetchProfilesIds = async (ndk: NDK) => {
    if (ndk instanceof NDK) {
      const profilesIds = await ndk.fetchTop({
        kinds: [0],
        //@ts-ignore
        search: searchParams.get("q"),
        limit: 200,
      });
      setProfilesIds(profilesIds?.ids ? profilesIds.ids : []);
      getProfiles(ndk, profilesIds?.ids ? profilesIds.ids : []);
    }
  };

  const fetchProfilesCount = async () => {
    try {
      const profilesCount = await ndk.fetchCount({
        kinds: [0],
        //@ts-ignore
        search: searchParams.get("q"),
      });
      setProfilesCount(profilesCount?.count ? profilesCount.count : 0);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (ndk instanceof NDK) {
      getProfiles(ndk, profilesIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitProfiles]);

  function compareByKeys(a: NDKEvent, b: NDKEvent, ids: string | any[]) {
    return ids.indexOf(a.id) - ids.indexOf(b.id);
  }

  const getProfiles = async (ndk: NDK, ids: string[]) => {
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
        setIsLoadingProfiles(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={cl.profiles}>
      <Search isLoading={isLoadingProfiles} />
      <h2 className={cl.prTitle}>
        Profiles <br />
        <span>found {profilesCount} profiles</span>
      </h2>
      {profiles.length !== 0 ? (
        profiles?.length ? (
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
        )
      ) : (
        <CardSkeleton cards={8} />
      )}
      {isLoadingProfiles && <p>Loading...</p>}
      <p>
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
