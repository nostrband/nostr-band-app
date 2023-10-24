import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Search from "../../components/Search/Search";
import cl from "./Trending.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import CardSkeleton from "../../components/CardSkeleton/CardSkeleton";
import ProfileItem from "../../components/ProfileItem/ProfileItem";
import { nostrApiType, nostrPeopleType } from "../../types/types";
import PostCard from "../../components/PostCard/PostCard";
import DatePicker from "react-datepicker";
import { formatDate } from "../../utils/formatDate";
import { Button } from "react-bootstrap";

const Trending = () => {
  const { type, date } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<nostrApiType[]>([]);
  const [videos, setVideos] = useState<nostrApiType[]>([]);
  const [profiles, setProfiles] = useState<nostrPeopleType[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  const getTrending = async (type?: string, date?: string) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/${type}?date=${date}`
      );
      if (type === "profiles") {
        setProfiles(data.profiles);
      } else if (type === "notes") {
        setPosts(data.notes);
      } else if (type === "videos") {
        setVideos(data.videos);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const day = formatDate(startDate);
    navigate(`/trending/${type}/${day}`);
    getTrending(type, day);
  }, [startDate, location.pathname]);

  const today = new Date();

  const goToPrevDay = () => {
    const prevDay = startDate.setDate(startDate.getDate() - 1);
    setStartDate(new Date(prevDay));
  };

  const goToNextDay = () => {
    const prevDay = startDate.setDate(startDate.getDate() + 1);
    setStartDate(new Date(prevDay));
  };

  return (
    <div className={cl.trending}>
      <Search isLoading={isLoading} />
      <h2>
        Trending {type} on {startDate.toDateString()}
      </h2>
      <div className={cl.datePicker}>
        {startDate.getDate() > new Date("2023-01-01").getDate() && (
          <Button variant="outline-primary" onClick={goToPrevDay}>
            Previous Day
          </Button>
        )}
        <DatePicker
          className={cl.datePickerInput}
          selected={startDate}
          onChange={setStartDate}
          dateFormat="yyyy-MM-dd"
          maxDate={new Date()}
          minDate={new Date("2023-01-01")}
        />
        {startDate.getDate() < today.getDate() && (
          <Button variant="outline-primary" onClick={goToNextDay}>
            Next Day
          </Button>
        )}
      </div>
      {profiles && profiles.length
        ? profiles.map((profile) => {
            const profileContent = profile?.profile?.content
              ? JSON.parse(profile.profile.content)
              : "";
            return (
              <ProfileItem
                key={profile.pubkey}
                pubKey={profile.pubkey}
                img={profileContent.picture}
                name={
                  profileContent.display_name
                    ? profileContent.display_name
                    : profileContent.name
                }
                bio={profileContent.about}
                mail={profileContent.nip05}
                newFollowersCount={profile.new_followers_count}
              />
            );
          })
        : // <CardSkeleton cards={8} />
          ""}

      {posts && posts.length
        ? posts.map((post) => {
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
        : // <CardSkeleton cards={8} />
          ""}

      {videos && videos.length
        ? videos.map((video) => {
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
        : // <CardSkeleton cards={8} />
          ""}
    </div>
  );
};

export default Trending;
