import { useEffect, useState } from "react";
import cl from "./Profiles.module.css";
import NDK from "@nostrband/ndk";
import Search from "../../../components/Search/Search";
import { useSearchParams } from "react-router-dom";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";

const Profiles = () => {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [profilesCount, setProfilesCount] = useState(0);
  const [ndk, setNdk] = useState(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState();
  const [profilesIds, setProfilesIds] = useState([]);
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
      if (profilesCount - profiles.length) {
        getMoreProfiles();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  useEffect(() => {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    setNdk(ndk);
    fetchProfilesIds(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfilesIds = async (ndk) => {
    if (ndk instanceof NDK) {
      const profilesIds = await ndk.fetchTop({
        kinds: [0],
        search: searchParams.get("q"),
        limit: 200,
      });
      setProfilesIds(profilesIds.ids);
      getProfiles(ndk, profilesIds.ids);
    }
  };

  useEffect(() => {
    getProfiles(ndk, profilesIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitProfiles]);

  useEffect(() => {
    getProfiles(ndk, profilesIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  function compareByKeys(a, b, ids) {
    return ids.indexOf(a.id) - ids.indexOf(b.id);
  }

  const getProfiles = async (ndk, ids) => {
    if (ndk instanceof NDK) {
      setIsLoadingProfiles(true);
      const profiles = Array.from(
        await ndk.fetchEvents({ kinds: [0], ids: ids.slice(0, limitProfiles) })
      );
      const sortedContentArray = profiles
        .slice()
        .sort((a, b) => compareByKeys(a, b, ids));
      setProfiles(sortedContentArray);
      const profilesCount = await ndk.fetchCount({
        kinds: [0],
        search: searchParams.get("q"),
      });
      setProfilesCount(profilesCount.count);
      setIsLoadingProfiles(false);
    }
  };

  return (
    <div className={cl.profiles}>
      <Search isLoading={isLoadingProfiles} />
      {!isLoadingProfiles ? (
        profiles?.length ? (
          <div className={cl.resultProfiles}>
            <h2 className={cl.prTitle}>
              Profiles <br />
              <span>found {profilesCount} profiles</span>
            </h2>
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
    </div>
  );
};

export default Profiles;
