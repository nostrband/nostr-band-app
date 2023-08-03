import { useEffect, useState } from "react";
import cl from "./AllResults.module.css";
import Search from "../../../components/Search/Search";
import ProfileItem from "../../Home/People/ProfileItem/ProfileItem";
import NDK from "@nostrband/ndk";
import { Link, useSearchParams } from "react-router-dom";

const AllResults = () => {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [profilesCount, setProfilesCount] = useState(0);
  const [ndk, setNdk] = useState(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState();

  useEffect(() => {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    setNdk(ndk);
    getProfiles(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getProfiles(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const getProfiles = async (ndk) => {
    if (ndk instanceof NDK) {
      setIsLoadingProfiles(true);
      const topProfilesIds = await ndk.fetchTop({
        kinds: [0],
        search: searchParams.get("q"),
        limit: 3,
      });
      const topProfiles = Array.from(
        await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
      );
      setProfiles(topProfiles);
      const profilesCount = await ndk.fetchCount({
        kinds: [0],
        search: searchParams.get("q"),
      });
      setProfilesCount(profilesCount.count);
      setIsLoadingProfiles(false);
    }
  };

  return (
    <div className={cl.result}>
      <Search isLoading={isLoadingProfiles} />
      {profiles && profiles?.length ? (
        <div className={cl.resultProfiles}>
          <h2>Profiles</h2>
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
      )}
      {profilesCount >= 4 && (
        <Link to={`/?q=${searchParams.get("q")}&type=profiles`}>
          And {profilesCount ? profilesCount : 0} more profiles →
        </Link>
      )}
    </div>
  );
};

export default AllResults;
