import { useEffect, useState } from "react";
import cl from "./AllResults.module.css";
import Search from "../../../components/Search/Search";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import PostCard from "../../../components/PostCard/PostCard";
import NDK from "@nostrband/ndk";
import { Link, useSearchParams } from "react-router-dom";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";

const AllResults = () => {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState([]);
  const [profilesCount, setProfilesCount] = useState(0);
  const [ndk, setNdk] = useState(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState();
  const [posts, setPosts] = useState([]);
  const [postsAuthors, setPostsAuthors] = useState([]);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    setNdk(ndk);
    getProfiles(ndk);
    getPosts(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getProfiles(ndk);
    getPosts(ndk);
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

  const getPosts = async (ndk) => {
    try {
      if (ndk instanceof NDK) {
        const posts = Array.from(
          await ndk.fetchEvents({
            kinds: [1],
            search: searchParams.get("q"),
            limit: 10,
          })
        );
        const postsAuthorsPks = posts.map((post) => post.pubkey);
        const postsAuthors = Array.from(
          await ndk.fetchEvents({ kinds: [0], authors: postsAuthorsPks })
        );
        setPosts(posts);
        setPostsAuthors(postsAuthors);
        const postsCount = await ndk.fetchCount({
          kinds: [1],
          search: searchParams.get("q"),
        });
        setPostsCount(postsCount?.count);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={cl.result}>
      <Search isLoading={isLoadingProfiles} />
      {!isLoadingProfiles ? (
        profiles?.length ? (
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
        )
      ) : (
        <CardSkeleton cards={3} />
      )}
      {profilesCount >= 4 && (
        <Link to={`/?q=${searchParams.get("q")}&type=profiles`}>
          And {profilesCount ? profilesCount : 0} more profiles →
        </Link>
      )}
      {posts?.length ? (
        <div className={cl.resPosts}>
          <h2>Results</h2>
          {posts.map((post) => {
            const postAuthor = postsAuthors.find(
              (author) => author.pubkey === post.pubkey
            );
            const authorContent = JSON.parse(postAuthor.content);

            return (
              <PostCard
                key={post.id}
                name={
                  authorContent.display_name
                    ? authorContent.display_name
                    : authorContent.name
                }
                picture={authorContent.picture}
                about={post.content}
                pubkey={post.pubkey}
                eventId={post.id}
                createdDate={post.created_at}
              />
            );
          })}
        </div>
      ) : (
        ""
      )}
      {postsCount >= 10 && (
        <Link to={`/?q=${searchParams.get("q")}&type=posts`}>
          And {postsCount ? postsCount : 0} more posts →
        </Link>
      )}
    </div>
  );
};

export default AllResults;
