import { useEffect, useState } from "react";
import cl from "./PostItem.module.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import {
  ArrowRepeat,
  Chat,
  HandThumbsUp,
  Lightning,
} from "react-bootstrap-icons";
import {
  collectLinksFromStr,
  defineTypeLink,
  strWithLinks,
} from "../../../../utils/formatLink";
import { Button } from "react-bootstrap";
import { formatAMPM } from "../../../../utils/formatDate";

const PostItem = ({ name, picture, about, pubkey, createdDate }) => {
  const [stats, setStats] = useState([]);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const createdDateAt = new Date(createdDate);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/profile/${pubkey}`
      );
      setStats(data.stats[pubkey]);
      // console.log(data.stats[pubkey]);
    } catch (e) {
      console.log(e);
    }
  };

  let contents = "";
  if (about) {
    const links = collectLinksFromStr(about);
    contents = links.map((link) => {
      const links = [];
      const obj = defineTypeLink(link);
      if(obj.type !== "NotMedia" && obj.type) {
        links.push(obj);
      }
      return links ? links : [];
    }).flat();
  }

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sats = stats?.zaps_received?.msats / 1000;

  return (
    <div className={cl.post}>
      <div className={cl.postName}>
        <div className={cl.postImage}>
          <img
            src={picture}
            alt="user avatar"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = `https://media.nostr.band/thumbs/${pubkey.slice(
                -4
              )}/${pubkey}-picture-64`;
            }}
          />
        </div>
        <p>{name}</p>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Open</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Copy npub</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Copy nprofile</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Copy pubkey</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <p className={cl.postAbout}>{strWithLinks(about)}</p>
      <div className={cl.postStats}>
        {stats?.zaps_received?.msats && (
          <div className={cl.postState}>
            <Lightning />
            <span>
              {Number(sats) > 1000000
                ? `${Math.round(sats / 1000000)}M`
                : Number(sats) >= 1000
                ? `${Math.round(sats / 1000)}K`
                : sats}
            </span>
          </div>
        )}
        {stats.report_count && (
          <div className={cl.postState}>
            <Chat />
            <span>{stats.report_count}</span>
          </div>
        )}
        {stats.repost_count && (
          <div className={cl.postState}>
            <ArrowRepeat />
            <span>
              {stats.repost_count > 1000
                ? `${Math.round(stats.repost_count / 1000)}K`
                : stats.repost_count}
            </span>
          </div>
        )}
        {stats.reaction_count && (
          <div className={cl.postState}>
            <HandThumbsUp />
            <span>
              {stats.reaction_count > 1000
                ? `${Math.round(stats.reaction_count / 1000)}K`
                : stats.reaction_count}
            </span>
          </div>
        )}

        <div className={cl.postState}>
          <span>{formatAMPM(createdDateAt)}</span>
        </div>
      </div>
      <div className={cl.btnLink}>
        {contents && contents.length ? (
          isBannerVisible ? (
            <Button onClick={() => setIsBannerVisible(false)} variant="light">
              Hide
            </Button>
          ) : (
            <Button onClick={() => setIsBannerVisible(true)} variant="light">
              {contents[0].type === "PictureType"  ? "Gallery" : "Play"}
            </Button>
          )
        ) : (
          ""
        )}
      </div>
      <div className={cl.bannerWrapper}>
        {isBannerVisible && contents.length
          ? contents.map((content, index) => {
              return (
                <div key={index} className={cl.banner}>
                  {content.type === "AudioType" ? (
                    <audio
                    className="audio-content"
                      src={content.url}
                      controls
                      preload="metadata"
                    />
                  ) : content.type === "YouTubeType" ? (
                    <iframe
                      title="youtube"
                      id="ytplayer"
                      className="youtube-fram"
                      type="text/html"
                      width="640"
                      height="360"
                      src={content.url}
                    />
                  ) : content.type === "MovieType" ? (
                    <video
                      className="play"
                      src={content.url}
                      controls
                      preload="metadata"
                    />
                  ) : content.type === "PictureType" ? (
                    <img
                      alt="content"
                      width="100%"
                      className="content-image"
                      src={content.url}
                    />
                  ) : (
                    ""
                  )}
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
};

export default PostItem;
