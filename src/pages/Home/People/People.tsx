import "./People.css";
import { useState, useEffect, FC } from "react";
import axios from "axios";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import { nostrPeopleType } from "../../../types/types";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import { Helmet } from "react-helmet";

type peopleTypes = {
  setIsLoading: (a: boolean) => void;
};

const People: FC<peopleTypes> = ({ setIsLoading }) => {
  const [profiles, setProfiles] = useState<nostrPeopleType[]>([]);
  const today = new Date();
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
      <Helmet>
        <title>Nostr.Band: Trending people on Nostr</title>
        <meta
          name="robots"
          content="index, follow, noimageindex, max-snippet:-1, max-image-preview:none, max-video-preview:-1, nositelinkssearchbox"
        />
      </Helmet>
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
      <Link
        className="yesterday-trending"
        to={`/trending/profiles/${formatDate(
          new Date(today.setDate(today.getDate() - 1))
        )}`}
      >
        See who was trending yesterday →
      </Link>
    </>
  );
};

export default People;
