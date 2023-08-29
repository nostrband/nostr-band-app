import axios from "axios";
import "./Images.module.css";
import { FC, useEffect, useState } from "react";
//@ts-ignore
import PostCard from "../../../components/PostCard/PostCard.tsx";
//@ts-ignore
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton.tsx";
import { nostrApiType } from "../../../types/types";
import React from "react";

type imagesTypes = {
  setIsLoading: (a: boolean) => void;
};

const Images: FC<imagesTypes> = ({ setIsLoading }) => {
  const [images, setImages] = useState<nostrApiType[]>([]);
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/images`
      );
      setImages(data.images);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {images && images.length ? (
        images.map((image) => {
          const authorContent = image?.author
            ? JSON.parse(image.author?.content)
            : {};
          return (
            <PostCard
              key={image.id}
              eventId={image.event.id}
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
        <CardSkeleton cards={8} />
      )}
    </>
  );
};

export default Images;
