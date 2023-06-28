import { useEffect, useState } from "react";
import axios from "axios";
import PostItem from "./PostItem/PostItem";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";

const Posts = ({ setIsLoading }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/notes`
      );
      setPosts(data.notes);
      // console.log(data);
    } catch (e) {
      console.log(e?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {posts && posts.length ? (
        posts.map((post) => {
          const authorContent = JSON.parse(post.author.content);
          console.log(authorContent);
          return (
            <PostItem
              key={post.id}
              name={
                authorContent.display_name
                  ? authorContent.display_name
                  : authorContent.name
              }
              about={post.event.content}
              picture={authorContent.picture}
              pubkey={post.event.pubkey}
              createdDate={post.event.created_at}
              // banner={postContent.banner}
            />
          );
        })
      ) : (
        <CardSkeleton cards={8} mode="posts" />
      )}
    </>
  );
};

export default Posts;
