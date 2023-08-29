import "./Home.css";
//@ts-ignore
import Search from "../../components/Search/Search.tsx";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
//@ts-ignore
import People from "./People/People.tsx";
import { Link, useSearchParams } from "react-router-dom";
//@ts-ignore
import Posts from "./Posts/Posts.tsx";
//@ts-ignore
import Images from "./Images/Images.tsx";
//@ts-ignore
import Video from "./Video/Video.tsx";
//@ts-ignore
import Audio from "./Audio/Audio.tsx";
//@ts-ignore
import Result from "../Result/Result.tsx";
import React from "react";

const Home = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const [trendingQuery, setTrendingQuery] = useState(
    searchParams.get("trending") ? searchParams.get("trending") : "people"
  );

  useEffect(() => {
    if (searchParams.get("trending")) {
      setTrendingQuery(searchParams.get("trending"));
    } else {
      setTrendingQuery("people");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("trending")]);

  return searchParams.get("q") ? (
    <Result />
  ) : (
    <div>
      <Search isLoading={isLoading} />
      <div className="home-hero">
        <h2 className="home-hero-title">
          Discover <span>Nostr</span>
        </h2>
        <p className="home-hero-subtitle">
          Learn what is trending <span>today</span>
        </p>
        <div className="home-hero__links">
          <Link to={`/?trending=people`}>
            <Button
              variant={`${trendingQuery === "people" ? "primary" : "link"}`}
            >
              People
            </Button>
          </Link>
          <Link to={`/?trending=posts`}>
            <Button
              variant={`${trendingQuery === "posts" ? "primary" : "link"}`}
            >
              Posts
            </Button>
          </Link>
          <Link to={`/?trending=zapped`}>
            <Button
              variant={`${trendingQuery === "zapped" ? "primary" : "link"}`}
            >
              Zapped
            </Button>
          </Link>
          <Link to={`/?trending=links`}>
            <Button
              variant={`${trendingQuery === "links" ? "primary" : "link"}`}
            >
              Links
            </Button>
          </Link>
          <Link to={`/?trending=hashtags`}>
            <Button
              variant={`${trendingQuery === "hashtags" ? "primary" : "link"}`}
            >
              Hashtags
            </Button>
          </Link>
          <Link to={`/?trending=images`}>
            <Button
              variant={`${trendingQuery === "images" ? "primary" : "link"}`}
            >
              Images
            </Button>
          </Link>
          <Link to={`/?trending=video`}>
            <Button
              variant={`${trendingQuery === "video" ? "primary" : "link"}`}
            >
              Video
            </Button>
          </Link>
          <Link to={`/?trending=audio`}>
            <Button
              variant={`${trendingQuery === "audio" ? "primary" : "link"}`}
            >
              Audio
            </Button>
          </Link>
        </div>
      </div>
      <div className="home-profiles">
        {trendingQuery === "people" ? (
          <People setIsLoading={setIsLoading} />
        ) : trendingQuery === "posts" ? (
          <Posts setIsLoading={setIsLoading} />
        ) : trendingQuery === "images" ? (
          <Images setIsLoading={setIsLoading} />
        ) : trendingQuery === "video" ? (
          <Video setIsLoading={setIsLoading} />
        ) : trendingQuery === "audio" ? (
          <Audio setIsLoading={setIsLoading} />
        ) : (
          ""
        )}
        <a className="yesterday-trending" href="http://localhost:3000/">
          See who was trending yesterday →
        </a>
      </div>
    </div>
  );
};

export default Home;
