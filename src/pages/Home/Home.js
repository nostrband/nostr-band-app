import "./Home.css";
import Search from "../../components/Search/Search";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState } from "react";
import { Button } from "react-bootstrap";
import People from "./People/People";
import { useSearchParams } from "react-router-dom";
import Posts from "./Posts/Posts";
import Images from "./Images/Images";
import Video from "./Video/Video";
import Audio from "./Audio/Audio";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [trendingQuery, setTrendingQuery] = useState(
    searchParams.get("trending") ? searchParams.get("trending") : "people"
  );

  const linkHandle = (trending) => {
    setSearchParams(`trending=${trending}`);
    setTrendingQuery(`${trending}`);
  };

  return (
    <Container>
      <Row className="justify-content-lg-center">
        <Col lg={9}>
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
                <Button
                  variant={`${trendingQuery === "people" ? "primary" : "link"}`}
                  onClick={() => linkHandle("people")}
                >
                  People
                </Button>
                <Button
                  variant={`${trendingQuery === "posts" ? "primary" : "link"}`}
                  onClick={() => linkHandle("posts")}
                >
                  Posts
                </Button>
                <Button
                  variant={`${trendingQuery === "zapped" ? "primary" : "link"}`}
                  onClick={() => linkHandle("zapped")}
                >
                  Zapped
                </Button>
                <Button
                  variant={`${trendingQuery === "links" ? "primary" : "link"}`}
                  onClick={() => linkHandle("links")}
                >
                  Links
                </Button>
                <Button
                  variant={`${
                    trendingQuery === "hashtags" ? "primary" : "link"
                  }`}
                  onClick={() => linkHandle("hashtags")}
                >
                  Hashtags
                </Button>
                <Button
                  variant={`${trendingQuery === "images" ? "primary" : "link"}`}
                  onClick={() => linkHandle("images")}
                >
                  Images
                </Button>
                <Button
                  variant={`${trendingQuery === "video" ? "primary" : "link"}`}
                  onClick={() => linkHandle("video")}
                >
                  Video
                </Button>
                <Button
                  variant={`${trendingQuery === "audio" ? "primary" : "link"}`}
                  onClick={() => linkHandle("audio")}
                >
                  Audio
                </Button>
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
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
