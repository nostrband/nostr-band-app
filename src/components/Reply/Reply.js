import { useEffect, useState } from "react";
import cl from "./Reply.module.css";
import UserIcon from "../../assets/user.png";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";
import axios from "axios";
import { Chat, HandThumbsUp } from "react-bootstrap-icons";
import { formatAMPM } from "../../utils/formatDate";

const Reply = ({ author, content, eventId, createdDateAt, mode }) => {
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/event/${eventId}`
      );
      setStats(data.stats[eventId]);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={mode === "rereply" ? cl.rereply : cl.reply}>
      <div className={cl.replyAuthorName}>
        <div className={cl.replyAuthorImage}>
          {!imgError ? (
            author.picture ? (
              <img
                src={author.picture}
                alt="avatar"
                onError={() => setImgError(true)}
              />
            ) : (
              <img alt="avatar" src={UserIcon} />
            )
          ) : (
            <img
              src={`https://media.nostr.band/thumbs/${"pubkey".slice(
                -4
              )}/${"pubkey"}-picture-64`}
              alt="avatar"
              onError={({ currentTarget }) => {
                currentTarget.srcset = UserIcon;
              }}
            />
          )}
        </div>
        <Link className={cl.replyAuthoNameLink} to={`/}`}>
          {author.display_name ? author.display_name : author.name}
        </Link>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item target="_blanc" href={`https://nostrapp.link/#`}>
              Open
            </Dropdown.Item>
            <Dropdown.Item>Copy npub</Dropdown.Item>
            <Dropdown.Item>Copy nprofile</Dropdown.Item>
            <Dropdown.Item>Copy pubkey</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className={cl.replyContent}>
        <MarkdownComponent content={content} />
      </div>
      <div className={cl.postStats}>
        {stats.reply_count && (
          <div className={cl.postState}>
            <Chat />
            <span>{stats.reply_count}</span>
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

        {createdDateAt && (
          <div className={cl.postState}>
            <span>{formatAMPM(createdDateAt * 1000)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reply;
