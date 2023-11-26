import axios from "axios";
import "./Images.module.css";
import { FC, useEffect, useState } from "react";
//@ts-ignore
import PostCard from "../../../components/PostCard/PostCard.tsx";
//@ts-ignore
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton.tsx";
import { nostrApiType } from "../../../types/types";
import { formatDate } from "../../../utils/formatDate";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

type imagesTypes = {
  setIsLoading: (a: boolean) => void;
};

const Images: FC<imagesTypes> = ({ setIsLoading }) => {
  const [images, setImages] = useState<nostrApiType[]>([]);
  const today = new Date();

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
      <Helmet>
        <title>Nostr.Band: Trending images on Nostr</title>
        <meta
          name="robots"
          content="index, follow, noimageindex, max-snippet:-1, max-image-preview:none, max-video-preview:-1, nositelinkssearchbox"
        />
      </Helmet>
      {images && images.length ? (
        images.map((image) => {
          const authorContent = image?.author?.content
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
      <Link
        className="yesterday-trending"
        to={`/trending/images/${formatDate(
          new Date(today.setDate(today.getDate() - 1))
        )}`}
      >
        See what was trending yesterday →
      </Link>
    </>
  );
};

export default Images;
