import axios from "axios";
import { FC, useEffect, useState } from "react";
//@ts-ignore
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton.tsx";
//@ts-ignore
import PostCard from "../../../components/PostCard/PostCard.tsx";
import React from "react";
import { nostrApiType } from "../../../types/types.js";

type audioTypes = {
  setIsLoading: (a: boolean) => void;
};

const Audio: FC<audioTypes> = ({ setIsLoading }) => {
  const [audios, setAudios] = useState<nostrApiType[]>([]);
  const fetchAudios = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/audios`
      );

      setAudios(data.audios);
    } catch (e) {
      console.log(e?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {audios && audios.length ? (
        audios.map((image) => {
          const authorContent = image.author
            ? JSON.parse(image?.author?.content)
            : {};
          return (
            <PostCard
              eventId={image.event.id}
              key={image.id}
              name={
                authorContent.display_name
                  ? authorContent.display_name
                  : authorContent.name
              }
              picture={authorContent.picture}
              pubkey={image.pubkey}
              about={image.event.content}
              createdDate={image.event.created_at}
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

export default Audio;
