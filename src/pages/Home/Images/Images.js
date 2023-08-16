import axios from "axios";
import "./Images.module.css";
import { useEffect, useState } from "react";
import PostCard from "../../../components/PostCard/PostCard";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";

const Images = ({ setIsLoading }) => {
  const [images, setImages] = useState([]);
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/images`
      );
      setImages(data.images);
    } catch (e) {
      console.log(e?.response?.data?.error);
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
            />
          );
        })
      ) : (
        <CardSkeleton cards={8} mode="posts" />
      )}
    </>
  );
};

export default Images;
