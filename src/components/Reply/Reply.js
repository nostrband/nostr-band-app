import { useEffect, useState } from "react";
import cl from "./Reply.module.css";
import UserIcon from "../../assets/user.png";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";
import axios from "axios";
import { Chat, HandThumbsUp } from "react-bootstrap-icons";
import { formatAMPM } from "../../utils/formatDate";
import { nip19 } from "nostr-tools";
import { copyUrl } from "../../utils/copy-funtions/copyFuntions";

const Reply = ({ author, content, eventId, createdDateAt, mode }) => {
  const authorContent = author ? JSON.parse(author.content) : "";
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();
  const noteId = nip19.noteEncode(eventId);
  const pk = author ? author?.pubkey : "";
  const nprofile = pk ? nip19.nprofileEncode({ pubkey: pk }) : "";
  const npub = pk ? nip19.npubEncode(pk) : "";
  const [agoTime, setAgoTime] = useState("");
  const timeNow = Date.now();

  useEffect(() => {
    if (timeNow - createdDateAt * 1000 <= 86400000) {
      const time = new Date(timeNow - createdDateAt * 1000);
      if (time.getHours()) {
        const hs = time.getHours();
        setAgoTime(`${hs} ${hs > 1 ? "hours" : "hour"} ago`);
      } else if (time.getMinutes()) {
        const minutes = time.getMinutes();
        setAgoTime(`${minutes} ${minutes > 1 ? "minutes" : "minute"} ago`);
      } else {
        const secs = time.getSeconds();
        setAgoTime(`${secs} ${secs > 5 ? "seconds ago" : "right now"}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <Link to={`/${npub}`}>
          <div className={cl.replyAuthorImage}>
            {!imgError ? (
              authorContent.picture ? (
                <img
                  src={authorContent.picture}
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
        </Link>
        <Link to={`/${npub}`} className={cl.replyAuthoNameLink}>
          {authorContent.display_name
            ? authorContent.display_name
            : authorContent.name}
        </Link>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              target="_blanc"
              href={`https://nostrapp.link/#${npub}`}
            >
              Open
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(npub)}>
              Copy npub
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(nprofile)}>
              Copy nprofile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(pk)}>
              Copy pubkey
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div
        className={cl.replyContent}
        onClick={() => {
          navigate(`/${noteId}`);
        }}
      >
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
            <span>{agoTime ? agoTime : formatAMPM(createdDateAt * 1000)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reply;
