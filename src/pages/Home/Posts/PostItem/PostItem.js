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
import { defineTypeLink, strWithLinks } from "../../../../utils/formatLink";
import { Button } from "react-bootstrap";

const PostItem = ({ name, picture, about, pubkey, createdDate, banner }) => {
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

  function formatAMPM(date) {
    let dateObj = new Date(date);

    let month = dateObj.getMonth() + 1;
    let day = dateObj.getDate();
    let year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes();
    let seconds = dateObj.getSeconds();
    let ampm = hours >= 12 ? "PM" : "AM";

    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    let formattedTime =
      month +
      "/" +
      day +
      "/" +
      year +
      ", " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds +
      " " +
      ampm;

    return formattedTime;
  }
  let content = "";
  if (banner) {
    content = defineTypeLink(banner);
  }

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cl.post}>
      <div className={cl.postName}>
        <div className={cl.postImage}>
          <img src={picture} alt="user avatar" />
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
              {Number(stats?.zaps_received?.msats) > 1000000
                ? `${Math.round(stats?.zaps_received?.msats / 1000000)}M`
                : Number(stats?.zaps_received?.msats) >= 1000
                ? `${Math.round(stats?.zaps_received?.msats / 1000)}K`
                : stats?.zaps_received?.msats}
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
        {content &&
          (isBannerVisible ? (
            <Button onClick={() => setIsBannerVisible(false)} variant="light">
              Hide
            </Button>
          ) : (
            <Button onClick={() => setIsBannerVisible(true)} variant="light">
              {content.type === "PictureType" ? "Gallery" : "Play"}
            </Button>
          ))}
      </div>
      {isBannerVisible && <div className={cl.banner}>{content.content}</div>}
    </div>
  );
};

export default PostItem;
