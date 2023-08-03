import { useState, useEffect } from "react";
import cl from "./Result.module.css";
import Search from "../../components/Search/Search";
import { useSearchParams } from "react-router-dom";
import ProfileItem from "../Home/People/ProfileItem/ProfileItem";
import NDK from "@nostrband/ndk";

const Result = () => {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [ndk, setNdk] = useState(null);

  useEffect(() => {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    setNdk(ndk);
    getProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const getProfiles = async () => {
    if (ndk instanceof NDK) {
      const topProfilesIds = await ndk.fetchTop({
        kinds: [0],
        search: searchParams.get("q"),
        limit: 3,
      });
      const topProfiles = Array.from(
        await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
      );
      setProfiles(topProfiles);
    }
  };

  return (
    <div className={cl.result}>
      <Search />
      {profiles && profiles?.length ? (
        <div className={cl.resultProfiles}>
          <h2>Profiles</h2>
          {profiles.map((profile) => {
            const profileContent = JSON.parse(profile.content);
            console.log(profileContent);
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
        ""
      )}
    </div>
  );
};

export default Result;
