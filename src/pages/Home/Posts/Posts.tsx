import { FC, useEffect, useState } from "react";
import axios from "axios";
//@ts-ignore
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton.tsx";
//@ts-ignore
import PostCard from "../../../components/PostCard/PostCard.tsx";
import { nostrApiType } from "../../../types/types.js";
import React from "react";

type postsTypes = {
  setIsLoading: (a: boolean) => void;
};

const Posts: FC<postsTypes> = ({ setIsLoading }) => {
  const [posts, setPosts] = useState<nostrApiType[]>([]);

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
          return (
            <PostCard
              key={post.id}
              name={
                authorContent.display_name
                  ? authorContent.display_name
                  : authorContent.name
              }
              about={post.event.content}
              picture={authorContent.picture}
              pubkey={post.pubkey}
              eventId={post.event.id}
              createdDate={post.event.created_at}
              thread={""}
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
