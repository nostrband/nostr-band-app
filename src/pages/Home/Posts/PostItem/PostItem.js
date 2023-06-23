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

const PostItem = ({ name, picture, about, pubkey, createdDate }) => {
  const [stats, setStats] = useState([]);
  const createdDateAt = new Date(createdDate);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/profile/${pubkey}`
      );
      setStats(data.stats[pubkey]);
    } catch (e) {
      console.log(e);
    }
  };

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  useEffect(() => {
    fetchStats();
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
      <p className={cl.postAbout}>{about}</p>
      <div className={cl.postStats}>
        <div className={cl.postState}>
          <Lightning />
          <span>
            {stats?.zaps_received?.msats > 1000000
              ? `${Math.round(stats?.zaps_received?.msats / 1000000)}M`
              : `${Math.round(stats?.zaps_received?.msats / 1000)}K`}
          </span>
        </div>
        <div className={cl.postState}>
          <Chat />
          <span>{stats.report_count}</span>
        </div>
        <div className={cl.postState}>
          <ArrowRepeat />
          <span>
            {stats.repost_count > 1000
              ? `${Math.round(stats.repost_count / 1000)}K`
              : stats.repost_count}
          </span>
        </div>
        <div className={cl.postState}>
          <HandThumbsUp />
          <span>
            {stats.reaction_count > 1000
              ? `${Math.round(stats.reaction_count / 1000)}K`
              : stats.reaction_count}
          </span>
        </div>
        <div className={cl.postState}>
          <span>
            {createdDateAt.getDay()}/{createdDateAt.getMonth()}/
            {createdDateAt.getFullYear()}, {formatAMPM(createdDateAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
