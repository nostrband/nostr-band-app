import "./People.css";
import { useState, useEffect, FC } from "react";
import axios from "axios";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import { nostrPeopleType } from "../../../types/types";

type peopleTypes = {
  setIsLoading: (a: boolean) => void;
};

const People: FC<peopleTypes> = ({ setIsLoading }) => {
  const [profiles, setProfiles] = useState<nostrPeopleType[]>([]);
  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/profiles`
      );

      setProfiles(data.profiles);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {profiles && profiles.length ? (
        profiles.map((profile) => {
          const profileContent = profile?.profile?.content
            ? JSON.parse(profile.profile.content)
            : "";
          return (
            <ProfileItem
              key={profile.pubkey}
              pubKey={profile.pubkey}
              img={profileContent.picture}
              name={
                profileContent.display_name
                  ? profileContent.display_name
                  : profileContent.name
              }
              bio={profileContent.about}
              mail={profileContent.nip05}
              newFollowersCount={profile.new_followers_count}
            />
          );
        })
      ) : (
        <CardSkeleton cards={8} />
      )}
    </>
  );
};

export default People;
