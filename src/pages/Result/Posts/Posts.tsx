import { useEffect, useState } from "react";
import cl from "./Posts.module.css";
import NDK, { NDKEvent } from "@nostrband/ndk";
import Search from "../../../components/Search/Search";
import { useSearchParams } from "react-router-dom";
import PostCard from "../../../components/PostCard/PostCard";
import { useAppSelector } from "../../../hooks/redux";
import { nip19 } from "@nostrband/nostr-tools";

const Posts = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<NDKEvent[]>([]);
  const [postsAuthors, setPostsAuthors] = useState<NDKEvent[]>([]);
  const [postsCount, setPostsCount] = useState<number>(0);
  const [limitPosts, setLimitPosts] = useState<number>(10);
  const [isBottom, setIsBottom] = useState<boolean>(false);

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

  const getMorePosts = () => {
    setLimitPosts((prevState) => prevState + 10);
  };

  useEffect(() => {
    if (isBottom) {
      if (postsCount - posts.length) {
        getMorePosts();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  useEffect(() => {
    if (ndk instanceof NDK) {
      if (searchParams.get("q")?.includes("following:")) {
        getFollowingPosts();
      } else if (searchParams.get("q")?.includes("by:")) {
        getUserPosts();
      } else {
        getPosts(ndk);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q"), limitPosts]);

  const getUserPosts = async () => {
    try {
      setIsLoading(true);
      const userNpub = searchParams.get("q")?.match(/npub[0-9a-zA-Z]+/g)![0];
      const userPk = userNpub ? nip19.decode(userNpub).data.toString() : "";
      const cleanSearch = searchParams
        .get("q")
        ?.split(" ")
        .filter((str) => !str.match(/by:npub[0-9a-zA-Z]+/g))
        .join(" ");

      const postsFilter = cleanSearch
        ? {
            kinds: [1],
            search: cleanSearch,
            authors: [userPk],
            limit: limitPosts,
          }
        : { kinds: [1], authors: [userPk], limit: limitPosts };

      const posts = Array.from(await ndk.fetchEvents(postsFilter));

      const postsCount = await ndk.fetchCount(postsFilter);
      setPostsCount(postsCount?.count ? postsCount.count : 0);

      const postsAuthorsPks = posts.map((post) => post.pubkey);
      const postsAuthors = Array.from(
        await ndk.fetchEvents({
          kinds: [0],
          authors: postsAuthorsPks,
          limit: limitPosts,
        })
      );
      setPosts(posts);
      setPostsAuthors(postsAuthors);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getFollowingPosts = async () => {
    try {
      setIsLoading(true);
      const userNpub = searchParams.get("q")?.match(/npub[0-9a-zA-Z]+/g)![0];
      const userPk = userNpub ? nip19.decode(userNpub).data : "";
      const cleanSearch = searchParams
        .get("q")
        ?.split(" ")
        .filter((str) => !str.match(/following:npub[0-9a-zA-Z]+/g))
        .join(" ");

      //@ts-ignore
      const userContacts = await ndk.fetchEvent({
        kinds: [3],
        authors: [userPk],
      });
      const followingPubkeys = userContacts
        ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
        : [];

      const postsFilter = cleanSearch
        ? {
            kinds: [1],
            search: cleanSearch,
            authors: followingPubkeys,
            limit: limitPosts,
          }
        : { kinds: [1], authors: followingPubkeys, limit: limitPosts };

      const posts = Array.from(await ndk.fetchEvents(postsFilter));

      const postsCount = await ndk.fetchCount(postsFilter);
      setPostsCount(postsCount?.count ? postsCount.count : 0);

      const postsAuthorsPks = posts.map((post) => post.pubkey);
      const postsAuthors = Array.from(
        await ndk.fetchEvents({
          kinds: [0],
          authors: postsAuthorsPks,
          limit: limitPosts,
        })
      );
      setPosts(posts);
      setPostsAuthors(postsAuthors);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchPostsCount = async () => {
    if (ndk instanceof NDK) {
      const postsCount = await ndk.fetchCount({
        kinds: [1],
        //@ts-ignore
        search: searchParams.get("q"),
      });
      setPostsCount(postsCount?.count ? postsCount.count : 0);
    }
  };

  const getPosts = async (ndk: NDK) => {
    try {
      if (ndk instanceof NDK) {
        setIsLoading(true);
        const posts = Array.from(
          await ndk.fetchEvents({
            kinds: [1],
            //@ts-ignore
            search: searchParams.get("q"),
            limit: limitPosts,
          })
        );
        const postsAuthorsPks = posts.map((post) => post.pubkey);
        const postsAuthors = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            authors: postsAuthorsPks,
            limit: limitPosts,
          })
        );
        setPosts(posts);
        setPostsAuthors(postsAuthors);
        fetchPostsCount();
        setIsLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={cl.profiles}>
      <Search isLoading={isLoading} />
      <h2 className={cl.prTitle}>
        Posts <br />
        <span>found {postsCount} posts</span>
      </h2>
      {posts?.length
        ? posts.map((post) => {
            const postAuthor = postsAuthors.find(
              (author) => author.pubkey === post.pubkey
            );
            const authorContent = postAuthor
              ? JSON.parse(postAuthor?.content)
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
          })
        : ""}
      {isLoading && <p>Loading...</p>}
      <p>{postsCount - posts.length === 0 ? `End of results` : ""}</p>
    </div>
  );
};

export default Posts;
