import "./People.css";
import React, { useState, useEffect, FC } from "react";
import axios from "axios";
//@ts-ignore
import ProfileItem from "../../../components/ProfileItem/ProfileItem.tsx";
//@ts-ignore
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton.tsx";
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
      console.error(e?.response?.data?.error);
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
          const profileContent = profile.profile
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
        <CardSkeleton cards={8} mode={""} />
      )}
    </>
  );
};

export default People;
