import { useEffect, useState } from "react";
import cl from "./Posts.module.css";
import NDK from "@nostrband/ndk";
import Search from "../../../components/Search/Search";
import { useSearchParams } from "react-router-dom";
import PostCard from "../../../components/PostCard/PostCard";

const Posts = () => {
  const [searchParams] = useSearchParams();
  const [ndk, setNdk] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsAuthors, setPostsAuthors] = useState([]);
  const [postsCount, setPostsCount] = useState(0);
  const [limitPosts, setLimitPosts] = useState(10);
  const [isBottom, setIsBottom] = useState(false);

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
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    setNdk(ndk);
    getPosts(ndk);
    fetchPostsCount(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getPosts(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitPosts]);

  const fetchPostsCount = async (ndk) => {
    if (ndk instanceof NDK) {
      const postsCount = await ndk.fetchCount({
        kinds: [1],
        search: searchParams.get("q"),
      });
      setPostsCount(postsCount?.count);
    }
  };

  useEffect(() => {
    getPosts(ndk);
    fetchPostsCount(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const getPosts = async (ndk) => {
    try {
      if (ndk instanceof NDK) {
        setIsLoading(true);
        const posts = Array.from(
          await ndk.fetchEvents({
            kinds: [1],
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
                createdDate={post.created_at}
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
