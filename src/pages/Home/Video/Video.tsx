import axios from "axios";
import "./Video.module.css";
import { FC, useEffect, useState } from "react";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import PostCard from "../../../components/PostCard/PostCard";
import { nostrApiType } from "../../../types/types";
import { Link } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";
import { Helmet } from "react-helmet";

type videoType = {
  setIsLoading: (a: boolean) => void;
};

const Video: FC<videoType> = ({ setIsLoading }) => {
  const [videos, setVideos] = useState<nostrApiType[]>([]);
  const today = new Date();

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/videos`
      );
      setVideos(data.videos);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Nostr.Band: Trending video on Nostr</title>
        <meta
          name="robots"
          content="index, follow, noimageindex, max-snippet:-1, max-image-preview:none, max-video-preview:-1, nositelinkssearchbox"
        />
      </Helmet>
      {videos && videos.length ? (
        videos.map((video) => {
          const authorContent = video?.author?.content
            ? JSON.parse(video?.author?.content)
            : {};
          return (
            <PostCard
              eventId={video.event.id}
              key={video.id}
              name={
                authorContent.display_name
                  ? authorContent.display_name
                  : authorContent.name
              }
              picture={authorContent.picture}
              pubkey={video.pubkey}
              about={video.event.content}
              createdDate={video.event.created_at}
              thread={""}
            />
          );
        })
      ) : (
        <CardSkeleton cards={8} />
      )}
      <Link
        className="yesterday-trending"
        to={`/trending/videos/${formatDate(
          new Date(today.setDate(today.getDate() - 1))
        )}`}
      >
        See what was trending yesterday →
      </Link>
    </>
  );
};

export default Video;
