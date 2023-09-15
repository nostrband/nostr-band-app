import { FC } from "react";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import PostCard from "../../../components/PostCard/PostCard";
import { nostrApiType } from "../../../types/types.js";

type postsTypes = {
  posts: nostrApiType[];
};

const Posts: FC<postsTypes> = ({ posts }) => {
  return (
    <>
      {posts && posts.length ? (
        posts.map((post) => {
          const authorContent = post?.author?.content
            ? JSON.parse(post.author.content)
            : {};
          return (
            <PostCard
              key={post.id}
              name={
                authorContent?.display_name
                  ? authorContent?.display_name
                  : authorContent?.name
              }
              about={post.event.content}
              picture={authorContent?.picture}
              pubkey={post.pubkey}
              eventId={post.event.id}
              createdDate={post.event.created_at}
              thread={""}
            />
          );
        })
      ) : (
        <CardSkeleton cards={8} />
      )}
    </>
  );
};

export default Posts;
