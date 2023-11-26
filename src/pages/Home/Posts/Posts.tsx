import { FC } from "react";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import PostCard from "../../../components/PostCard/PostCard";
import { nostrApiType } from "../../../types/types.js";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import { NDKEvent } from "@nostrband/ndk";
import { Helmet } from "react-helmet";

type postsTypes = {
  posts: nostrApiType[];
  taggedProfiles: (NDKEvent | string)[];
};

const Posts: FC<postsTypes> = ({ posts, taggedProfiles }) => {
  const today = new Date();

  return (
    <>
      <Helmet>
        <title>Nostr.Band: Trending video on Nostr</title>
        <meta
          name="robots"
          content="index, follow, noimageindex, max-snippet:-1, max-image-preview:none, max-video-preview:-1, nositelinkssearchbox"
        />
      </Helmet>
      {posts && posts.length ? (
        posts.map((post) => {
          const authorContent = post?.author?.content
            ? JSON.parse(post.author.content)
            : {};
          return (
            <PostCard
              taggedProfiles={taggedProfiles}
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
      <Link
        className="yesterday-trending"
        to={`/trending/notes/${formatDate(
          new Date(today.setDate(today.getDate() - 1))
        )}`}
      >
        See what was trending yesterday →
      </Link>
    </>
  );
};

export default Posts;
