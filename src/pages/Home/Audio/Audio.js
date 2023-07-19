import axios from "axios";
import { useEffect, useState } from "react";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import PostCard from "../../../components/PostCard/PostCard";

const Audio = ({ setIsLoading }) => {
  const [audios, setAudios] = useState([]);
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
          const authorContent = JSON.parse(image.author.content);
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
