import { useEffect, useState } from "react";
import cl from "./AllResults.module.css";
//@ts-ignore
import Search from "../../../components/Search/Search.tsx";
//@ts-ignore
import ProfileItem from "../../../components/ProfileItem/ProfileItem.tsx";
//@ts-ignore
import PostCard from "../../../components/PostCard/PostCard.tsx";
import NDK, { NDKEvent } from "@nostrband/ndk";
import { Link, useSearchParams } from "react-router-dom";
//@ts-ignore
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton.tsx";
import React from "react";

const AllResults = () => {
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [ndk, setNdk] = useState<NDK>();
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [posts, setPosts] = useState<NDKEvent[]>([]);
  const [postsAuthors, setPostsAuthors] = useState<NDKEvent[]>([]);
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
    if (ndk instanceof NDK) {
      getProfiles(ndk);
      getPosts(ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const getProfiles = async (ndk: NDK) => {
    if (ndk instanceof NDK) {
      setIsLoadingProfiles(true);
      const topProfilesIds = await ndk.fetchTop({
        kinds: [0],
        //@ts-ignore
        search: searchParams.get("q"),
        limit: 3,
      });
      const topProfiles = Array.from(
        //@ts-ignore
        await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
      );
      setProfiles(topProfiles);
      const profilesCount = await ndk.fetchCount({
        kinds: [0],
        //@ts-ignore
        search: searchParams.get("q"),
      });
      setProfilesCount(profilesCount?.count ? profilesCount.count : 0);
      setIsLoadingProfiles(false);
    }
  };

  const getPosts = async (ndk) => {
    try {
      if (ndk instanceof NDK) {
        const posts = Array.from(
          await ndk.fetchEvents({
            kinds: [1],
            //@ts-ignore
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
          //@ts-ignore
          search: searchParams.get("q"),
        });
        setPostsCount(postsCount?.count ? postsCount.count : 0);
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
                  newFollowersCount={0}
                />
              );
            })}
          </div>
        ) : (
          "No profiles"
        )
      ) : (
        <CardSkeleton cards={3} mode={""} />
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
            const authorContent = postAuthor
              ? JSON.parse(postAuthor.content)
              : {};

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
                createdDate={post.created_at ? post.created_at : 0}
                thread={""}
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
