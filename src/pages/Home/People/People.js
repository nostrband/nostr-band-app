import "./People.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileItem from "./ProfileItem/ProfileItem";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";

const People = ({ setIsLoading }) => {
  const [profiles, setProfiles] = useState([]);
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
  }, []);

  return (
    <>
      {profiles && profiles.length
        ? profiles.map((profile) => {
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
                twitter={profileContent.username}
                mail={profileContent.nip05}
                newFollowersCount={profile.new_followers_count}
              />
            );
          })
        : <CardSkeleton cards={8} />}
    </>
  );
};

export default People;
