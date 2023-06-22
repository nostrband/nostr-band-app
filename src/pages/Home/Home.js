import "./Home.css";
import Search from "../../components/Search/Search";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProfileItem from "../../components/ProfileItem/ProfileItem";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

const Home = () => {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        "https://api.nostr.band/v0/trending/profiles"
      );
      setProfiles(data.profiles);
    } catch (e) {
      console.error(e?.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

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
                <Button>People</Button>
                <Button variant="link">Posts</Button>
                <Button variant="link">Zapped</Button>
                <Button variant="link">Links</Button>
                <Button variant="link">Hashtags</Button>
                <Button variant="link">Images</Button>
                <Button variant="link">Video</Button>
                <Button variant="link">Audio</Button>
              </div>
            </div>
            <div className="home-profiles">
              {profiles && profiles.length
                ? profiles.map((profile) => {
                    const profileContent = profile.profile
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
                        twitter={profileContent.username}
                        mail={profileContent.nip05}
                        newFollowersCount={profile.new_followers_count}
                      />
                    );
                  })
                : "Loading..."}
              {profiles && profiles.length ? (
                <a className="yesterday-trending">
                  See who was trending yesterday →
                </a>
              ) : (
                ""
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
