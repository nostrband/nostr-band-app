import { FC, useEffect, useMemo, useState } from "react";
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
import { profileType, statsType } from "../../types/types";
import NDK, { NDKEvent } from "@nostrband/ndk";
import { extractNostrStrings, replaceNostrLinks } from "../../utils/formatLink";
import { formatNostrContent } from "../../utils/formatContent";

type replyTypes = {
  author: profileType;
  content: string;
  eventId: string;
  createdDateAt: number;
  mode?: string;
  taggedProfiles?: (NDKEvent | string)[];
};

const Reply: FC<replyTypes> = ({
  author,
  content,
  eventId,
  createdDateAt,
  mode,
  taggedProfiles,
}) => {
  const authorContent = author?.content ? JSON.parse(author.content) : "";
  const [imgError, setImgError] = useState<boolean>(false);
  const [stats, setStats] = useState<statsType>({});
  const navigate = useNavigate();
  const noteId = nip19.noteEncode(eventId);
  const pk = author?.pubkey ? author?.pubkey : "";
  const nprofile = pk ? nip19.nprofileEncode({ pubkey: pk }) : "";
  const npub = pk ? nip19.npubEncode(pk) : "";
  const agoTime = formatAMPM(createdDateAt * 1000);
  const [aboutContent, setAboutContent] = useState(content);

  useEffect(() => {
    const newContent = formatNostrContent(
      content,
      taggedProfiles ? taggedProfiles : []
    );
    setAboutContent(newContent);
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async (): Promise<void> => {
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
        <MarkdownComponent content={aboutContent} mode="" />
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
            <Link to={`/${noteId}`}>
              <span>
                {agoTime ? agoTime : formatAMPM(createdDateAt * 1000)}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reply;
