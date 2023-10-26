import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import useWindowDimensions from "../../hooks/screen";
import { ArrowLeft, ArrowRight } from "react-bootstrap-icons";

const Trending = () => {
  const { type, date } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<nostrApiType[]>([]);
  const [videos, setVideos] = useState<nostrApiType[]>([]);
  const [images, setImages] = useState<nostrApiType[]>([]);
  const [audios, setAudios] = useState<nostrApiType[]>([]);
  const [profiles, setProfiles] = useState<nostrPeopleType[]>([]);
  const [startDate, setStartDate] = useState(
    date ? new Date(date) : new Date()
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowDimensions();

  const d = new Date(startDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const max_month_date = new Date(
    Date.UTC(d.getFullYear(), d.getMonth() + 1, 0)
  ).getDate();
  const md = new Date(
    Math.min(
      new Date(
        Date.UTC(d.getFullYear(), d.getMonth(), max_month_date)
      ).getTime(),
      new Date().getTime()
    )
  );

  const getTrending = async (type?: string, date?: string) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/trending/${type}?date=${formatDate(
          startDate
        )}`
      );
      if (type === "profiles") {
        setProfiles(data.profiles);
      } else if (type === "notes") {
        setPosts(data.notes);
      } else if (type === "videos") {
        setVideos(data.videos);
      } else if (type === "images") {
        setImages(data.images);
      } else if (type === "audios") {
        setAudios(data.audios);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setPosts([]);
    setProfiles([]);
    setVideos([]);
    setAudios([]);
    setImages([]);
  };

  useEffect(() => {
    clear();
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

  const getAvaibleDays = (): JSX.Element[] => {
    const days = [];
    for (let i = 1; i <= md.getDate(); i++) {
      const dt = formatDate(
        new Date(Date.UTC(d.getFullYear(), d.getMonth(), i))
      );
      const cur = i == d.getDate();
      days.push(
        <a
          className={`btn btn-sm btn-outline-${
            cur ? "secondary" : "primary"
          } text-center dates`}
          data-date={`${dt}`}
          href={`/trending/${type}/${dt}`}
          style={{ width: "2.5rem", marginRight: ".2rem" }}
        >
          {i}
        </a>
      );
    }
    return days;
  };

  const getAvaibleMonths = (): JSX.Element[] => {
    const months = [];
    const mm = new Date(
      Math.min(
        new Date(Date.UTC(d.getFullYear(), 11)).getTime(),
        new Date().getTime()
      )
    );
    for (let i = 0; i <= mm.getMonth(); i++) {
      const dt = formatDate(new Date(Date.UTC(d.getFullYear(), i)));
      const cur = i == d.getMonth();
      months.push(
        <a
          style={{ marginRight: ".3rem" }}
          className={`btn btn-sm btn-outline-${
            cur ? "secondary" : "primary"
          } dates' data-date='${dt}`}
          href={`/trending/${type}/${dt}`}
        >
          {monthNames[i]}
        </a>
      );
    }
    return months;
  };

  return (
    <div className={cl.trending}>
      <Search isLoading={isLoading} />
      <h2>
        Trending {type} on {startDate.toDateString()}
      </h2>
      <div className={cl.datePicker}>
        {startDate > new Date("2023-01-02") && (
          <Button variant="outline-primary" onClick={goToPrevDay}>
            <ArrowLeft /> {width >= 700 && "Previous Day"}
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
        {startDate < new Date(today.setDate(today.getDate() - 1)) && (
          <Button variant="outline-primary" onClick={goToNextDay}>
            {width >= 700 && "Next Day"} <ArrowRight />
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

      {
        images && images.length
          ? images.map((image) => {
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
          : ""
        // <CardSkeleton cards={8} />
      }

      {
        audios && audios.length
          ? audios.map((image) => {
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
          : ""
        // <CardSkeleton cards={8} />
      }

      <div className={cl.dayPicker}>
        <div className={cl.dayPickerMonth}>
          <p>
            <strong>{monthNames[d.getMonth()]}: </strong>
          </p>
          <div>
            {getAvaibleDays().map((i, index) => (
              <span key={index}>{i}</span>
            ))}
          </div>
        </div>
        <div className={cl.monthPickerMonth}>
          <p>
            <strong>{d.getFullYear()}: </strong>
          </p>
          <div>
            {getAvaibleMonths().map((i, index) => (
              <span key={index}>{i}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
