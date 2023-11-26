import "./Home.css";
import Search from "../../components/Search/Search";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import People from "./People/People";
import { Link, useSearchParams } from "react-router-dom";
import Posts from "./Posts/Posts";
import Images from "./Images/Images";
import Video from "./Video/Video";
import Audio from "./Audio/Audio";
import Result from "../Result/Result";
import { nostrApiType } from "../../types/types";
import axios from "axios";
import { NDKEvent } from "@nostrband/ndk";
import { nip19 } from "@nostrband/nostr-tools";
import { extractNostrStrings } from "../../utils/formatLink";
import { useAppSelector } from "../../hooks/redux";
import { Helmet } from "react-helmet";

const Home = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const [trendingQuery, setTrendingQuery] = useState(
    searchParams.get("trending") ? searchParams.get("trending") : "people"
  );
  const [posts, setPosts] = useState<nostrApiType[]>([]);
  const [taggedProfiles, setTaggedProfiles] = useState<(NDKEvent | string)[]>(
    []
  );

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<{ notes: nostrApiType[] }>(
        `${process.env.REACT_APP_API_URL}/trending/notes`
      );

      const postsLinks = data.notes
        .map((post: nostrApiType) => extractNostrStrings(post.event.content))
        .flat();
      const notNpubLinks = postsLinks.filter((r) => !r.startsWith("npub"));
      const npubs = postsLinks.filter((r) => r.startsWith("npub"));
      const pubkeys = npubs.map((npub) => nip19.decode(npub).data);

      const postsTaggedUsers = Array.from(
        //@ts-ignore
        await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
      );
      const allPostsTagged = [...notNpubLinks, ...postsTaggedUsers];

      setTaggedProfiles(allPostsTagged);
      setPosts(data.notes);
      // console.log(data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
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
      <Helmet>
        <title>Nostr.Band: Trending people on Nostr</title>
        <meta
          name="description"
          content="NH-based organization. Our mission is to spread adoption and educate people on Bitcoin."
        />
      </Helmet>
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
          {/* <Link to={`/?trending=zapped`}>
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
          </Link> */}
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
          <Posts posts={posts} taggedProfiles={taggedProfiles} />
        ) : trendingQuery === "images" ? (
          <Images setIsLoading={setIsLoading} />
        ) : trendingQuery === "video" ? (
          <Video setIsLoading={setIsLoading} />
        ) : trendingQuery === "audio" ? (
          <Audio setIsLoading={setIsLoading} />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Home;
