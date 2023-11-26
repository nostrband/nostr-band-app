import axios from "axios";
import { FC, useEffect, useState } from "react";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import PostCard from "../../../components/PostCard/PostCard";
import { nostrApiType } from "../../../types/types.js";
import { formatDate } from "../../../utils/formatDate";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

type audioTypes = {
  setIsLoading: (a: boolean) => void;
};

const Audio: FC<audioTypes> = ({ setIsLoading }) => {
  const [audios, setAudios] = useState<nostrApiType[]>([]);
  const today = new Date();

  const fetchAudios = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/audios`
      );

      setAudios(data.audios);
    } catch (e) {
      console.log(e);
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
      <Helmet>
        <title>Nostr.Band: Trending audios on Nostr</title>
        <meta
          name="description"
          content="Nostr.Band · Stats; Top. People · Posts · Images · Video · Audio. Products. Stats · API · Relay · Relay Browser · Embed widget ..."
        />
      </Helmet>
      {audios && audios.length ? (
        audios.map((image) => {
          const authorContent = image?.author?.content
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
        <CardSkeleton cards={8} />
      )}
      <Link
        className="yesterday-trending"
        to={`/trending/audios/${formatDate(
          new Date(today.setDate(today.getDate() - 1))
        )}`}
      >
        See what was trending yesterday →
      </Link>
    </>
  );
};

export default Audio;
