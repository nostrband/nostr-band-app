import { useEffect, useMemo, useState } from "react";
import cl from "./AllResults.module.css";
import Search from "../../../components/Search/Search";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import PostCard from "../../../components/PostCard/PostCard";
import NDK, { NDKEvent } from "@nostrband/ndk";
import { Link, useSearchParams } from "react-router-dom";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import { useAppSelector } from "../../../hooks/redux";
import { nip19 } from "@nostrband/nostr-tools";
import { dateToUnix } from "nostr-react";
import { extractNostrStrings } from "../../../utils/formatLink";

const AllResults = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [searchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [posts, setPosts] = useState<NDKEvent[]>([]);
  const [postsAuthors, setPostsAuthors] = useState<NDKEvent[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [taggedProfiles, setTaggedProfiles] = useState<(NDKEvent | string)[]>(
    []
  );
  const search = searchParams.get("q");

  useEffect(() => {
    if (ndk instanceof NDK) {
      getProfiles(ndk);
      getPosts(ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const fetchTaggedUsers = async (posts: NDKEvent[]) => {
    const postsLinks = posts
      .map((post) => extractNostrStrings(post.content))
      .flat();
    const notNpubLinks = postsLinks.filter((r) => !r.startsWith("npub"));
    const npubs = postsLinks.filter((r) => r.startsWith("npub"));
    const pubkeys = npubs.map((npub) => nip19.decode(npub).data);

    const postsTaggedUsers = Array.from(
      //@ts-ignore
      await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
    );
    const allPostsTagged = [...notNpubLinks, ...postsTaggedUsers];

    setTaggedProfiles(allPostsTagged);
  };

  const cleanSearch = useMemo(() => {
    return search
      ?.split(" ")
      .filter((str) =>
        str.includes("following:")
          ? !str.match(/following:npub[0-9a-zA-Z]+/g)
          : !str.match(/by:npub[0-9a-zA-Z]+/g)
      )
      .join(" ")
      .replace(/#[a-zA-Z0-9_]+/g, "")
      .replace(/lang:[a-zA-Z0-9_]+/g, "")
      .replace(/since:\d{4}-\d{2}-\d{2}/, "")
      .replace(/until:\d{4}-\d{2}-\d{2}/, "");
  }, [search]);

  const tagsWithHash = search
    ?.split(" ")
    .filter((s) => s.match(/#[a-zA-Z0-9_]+/g)?.toString());
  const tags = tagsWithHash?.map((tag) => tag.replace("#", ""));
  const langsWithPrefix = search
    ?.split(" ")
    .filter((s) => s.match(/lang:[a-zA-Z]+/g)?.toString());
  const langs = langsWithPrefix?.map((lang) => lang.replace("lang:", ""));
  const since = search?.match(/since:\d{4}-\d{2}-\d{2}/)
    ? dateToUnix(
        new Date(
          search?.match(/since:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
        )
      )
    : "";
  const until = search?.match(/until:\d{4}-\d{2}-\d{2}/)
    ? dateToUnix(
        new Date(
          search?.match(/until:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
        )
      )
    : "";

  const getProfiles = async (ndk: NDK) => {
    if (ndk instanceof NDK) {
      setIsLoadingProfiles(true);
      const filter = { kinds: [0], limit: 3 };
      if (cleanSearch?.trim()) {
        Object.defineProperty(filter, "search", {
          value: cleanSearch.trimStart().trimEnd(),
          enumerable: true,
        });
      }

      if (tags?.length) {
        Object.defineProperty(filter, "t", {
          value: tags,
          enumerable: true,
        });
      }

      if (since) {
        Object.defineProperty(filter, "since", {
          value: since,
          enumerable: true,
        });
        if (!until) {
          Object.defineProperty(filter, "until", {
            value: dateToUnix(new Date()),
            enumerable: true,
          });
        }
      }

      if (until) {
        Object.defineProperty(filter, "until", {
          value: until,
          enumerable: true,
        });
      }

      if (langs?.length) {
        Object.defineProperty(filter, "@lang", {
          value: langs,
          enumerable: true,
        });
      }
      if (search?.includes("following:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";

        //@ts-ignore
        const userContacts = await ndk.fetchEvent({
          kinds: [3],
          authors: [userPk],
        });
        const followingPubkeys = userContacts
          ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
          : [];

        if (followingPubkeys.length) {
          Object.defineProperty(filter, "authors", {
            value: followingPubkeys,
            enumerable: true,
          });
        }

        console.log("profilesFilter", filter);

        const topProfilesIds = await ndk.fetchTop(filter);
        const topProfiles = Array.from(
          //@ts-ignore
          await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
        );
        setProfiles(topProfiles);
        setProfilesCount(userContacts?.tags?.length ?? 0);
      } else if (search?.includes("by:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";
        if (userPk) {
          Object.defineProperty(filter, "authors", {
            value: [userPk],
            enumerable: true,
          });
        }

        console.log("profilesFilter", filter);
        //@ts-ignore
        const user = await ndk.fetchEvent(filter);
        setProfiles(user ? [user] : []);

        setProfilesCount(1);
      } else {
        console.log("profilesFilter", filter);
        const topProfilesIds = await ndk.fetchTop(filter);

        const topProfiles = topProfilesIds
          ? Array.from(
              //@ts-ignore
              await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
            )
          : [];
        setProfiles(topProfiles);
        const profilesCount = await ndk.fetchCount(filter);
        setProfilesCount(profilesCount?.count ?? 0);
      }
      setIsLoadingProfiles(false);
    }
  };

  const getPosts = async (ndk: NDK) => {
    try {
      if (ndk instanceof NDK) {
        setIsLoadingPosts(true);
        const filter = { kinds: [1], limit: 10 };
        if (cleanSearch?.trim()) {
          Object.defineProperty(filter, "search", {
            value: cleanSearch.trimStart().trimEnd(),
            enumerable: true,
          });
        }

        if (tags?.length) {
          Object.defineProperty(filter, "t", {
            value: tags,
            enumerable: true,
          });
        }

        if (since) {
          Object.defineProperty(filter, "since", {
            value: since,
            enumerable: true,
          });
          if (!until) {
            Object.defineProperty(filter, "until", {
              value: dateToUnix(new Date()),
              enumerable: true,
            });
          }
        }

        if (until) {
          Object.defineProperty(filter, "until", {
            value: until,
            enumerable: true,
          });
        }

        if (langs?.length) {
          Object.defineProperty(filter, "@lang", {
            value: langs,
            enumerable: true,
          });
        }

        if (search?.includes("following:")) {
          const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
          const userPk = userNpub ? nip19.decode(userNpub).data : "";

          //@ts-ignore
          const userContacts = await ndk.fetchEvent({
            kinds: [3],
            authors: [userPk],
          });
          const followingPubkeys = userContacts
            ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
            : [];

          if (followingPubkeys.length) {
            Object.defineProperty(filter, "authors", {
              value: followingPubkeys,
              enumerable: true,
            });
          }
          const posts = Array.from(await ndk.fetchEvents(filter));

          const postsCount = await ndk.fetchCount(filter);
          setPostsCount(postsCount?.count ?? 0);

          const postsAuthorsPks = posts.map((post) => post.pubkey);
          const postsAuthors = Array.from(
            await ndk.fetchEvents({
              kinds: [0],
              authors: postsAuthorsPks,
              limit: 10,
            })
          );
          fetchTaggedUsers(posts);
          setPosts(posts);
          setPostsAuthors(postsAuthors);
        } else if (search?.includes("by:")) {
          const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
          const userPk = userNpub ? nip19.decode(userNpub).data.toString() : "";

          const postsFilter = { kinds: [1], authors: [userPk], limit: 10 };

          if (userPk) {
            Object.defineProperty(filter, "authors", {
              value: [userPk],
              enumerable: true,
            });
          }

          console.log("postsFilter", filter);

          const posts = Array.from(await ndk.fetchEvents(filter));
          fetchTaggedUsers(posts);
          const postsCount = await ndk.fetchCount(filter);
          setPostsCount(postsCount?.count ?? 0);

          const postsAuthorsPks = posts.map((post) => post.pubkey);
          const postsAuthors = Array.from(
            await ndk.fetchEvents({
              kinds: [0],
              authors: postsAuthorsPks,
              limit: 10,
            })
          );
          setPosts(posts);
          setPostsAuthors(postsAuthors);
        } else {
          console.log("postsFilter", filter);
          const posts = Array.from(await ndk.fetchEvents(filter));
          fetchTaggedUsers(posts);
          const postsAuthorsPks = posts.map((post) => post.pubkey);
          const postsAuthors = Array.from(
            await ndk.fetchEvents({ kinds: [0], authors: postsAuthorsPks })
          );
          setPosts(posts);
          setPostsAuthors(postsAuthors);
          const postsCount = await ndk.fetchCount(filter);
          setPostsCount(postsCount?.count ?? 0);
          setIsLoadingPosts(false);
        }
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
          ""
        )
      ) : (
        <CardSkeleton cards={3} />
      )}
      {profilesCount >= 4 && (
        <Link
          className={cl.moreLink}
          to={`/?q=${searchParams.get("q")}&type=profiles`}
        >
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
                taggedProfiles={taggedProfiles}
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
        <Link
          className={cl.moreLink}
          to={`/?q=${searchParams.get("q")}&type=posts`}
        >
          And {postsCount ? postsCount : 0} more posts →
        </Link>
      )}

      {!isLoadingProfiles &&
        !isLoadingPosts &&
        !posts.length &&
        !profiles.length && <div>Nothing found :(</div>}
    </div>
  );
};

export default AllResults;
