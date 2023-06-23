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
      console.log(data);
    } catch (e) {
      console.log(e?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      {posts && posts.length
        ? posts.map((post) => {
            const postContent = JSON.parse(post.author.content);
            // console.log(postContent);
            return (
              <PostItem
                key={post.id}
                name={postContent.display_name}
                about={postContent.about}
                picture={postContent.picture}
                pubkey={post.pubkey}
                createdDate={post.author.created_at}
              />
            );
          })
        : <CardSkeleton cards={8} mode="posts" />}
    </>
  );
};

export default Posts;
