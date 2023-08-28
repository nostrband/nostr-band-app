import axios from "axios";
import "./Video.module.css";
import { FC, useEffect, useState } from "react";
//@ts-ignore
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton.tsx";
//@ts-ignore
import PostCard from "../../../components/PostCard/PostCard.tsx";
import { nostrApiType } from "../../../types/types";
import React from "react";

type videoType = {
  setIsLoading: (a: boolean) => void;
};

const Video: FC<videoType> = ({ setIsLoading }) => {
  const [videos, setVideos] = useState<nostrApiType[]>([]);
  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/videos`
      );
      setVideos(data.videos);
    } catch (e) {
      console.log(e?.response?.data?.error);
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
      {videos && videos.length ? (
        videos.map((video) => {
          const authorContent = video?.author
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
        <CardSkeleton cards={8} mode="posts" />
      )}
    </>
  );
};

export default Video;
