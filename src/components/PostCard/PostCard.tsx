import { useEffect, useState, useRef, FC } from "react";
import cl from "./PostCard.module.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import {
  ArrowRepeat,
  Chat,
  HandThumbsUp,
  ImageFill,
  Lightning,
  PlayBtnFill,
  X,
} from "react-bootstrap-icons";
import { extractNostrStrings, replaceNostrLinks } from "../../utils/formatLink";
import { Button } from "react-bootstrap";
import { formatAMPM } from "../../utils/formatDate";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";
import UserIcon from "../../assets/user.png";
import { Link, useNavigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import { copyUrl } from "../../utils/copy-funtions/copyFuntions";
import NDK, { NDKEvent } from "@nostrband/ndk";
import { statsType } from "../../types/types";
import Gallery from "../Gallery/Gallery";
import { formatContent } from "../../utils/formatContent";

type postItemType = {
  name: string;
  picture: string;
  about: string;
  pubkey: string;
  createdDate: number;
  eventId: string;
  ndk?: NDK;
  thread: string;
};

const PostItem: FC<postItemType> = ({
  name,
  picture,
  about,
  pubkey,
  createdDate,
  eventId,
  thread,
  ndk,
}) => {
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState<statsType>({});
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const createdDateAt = new Date(createdDate * 1000);
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [taggedProfiles, setTaggedProfiles] = useState<(NDKEvent | string)[]>(
    []
  );
  const [content, setContent] = useState(about);

  const fetchProfiles = async (pubkeys: string[]) => {
    if (ndk) {
      const profiles: NDKEvent[] = Array.from(
        await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
      );

      setTaggedProfiles(profiles.length ? profiles : pubkeys);
    }
  };

  if (content) {
    const links = extractNostrStrings(content);
    if (links) {
      const pubkeys = links.map((link: string) => {
        if (link.startsWith("npub")) {
          return nip19.decode(link).data;
        }
        return link;
      });
      if (ndk instanceof NDK) {
        if (pubkeys.length > 0) {
          // fetchProfiles(pubkeys as string[]);
        }
      }
    }
  }

  useEffect(() => {
    if (taggedProfiles) {
      taggedProfiles.map((profile) => {
        if (profile instanceof NDKEvent) {
          const profileContent = JSON.parse(profile.content);
          const npub = nip19.npubEncode(profile.pubkey);
          setContent(
            replaceNostrLinks(
              content,
              profileContent?.display_name
                ? `@${profileContent?.display_name}`
                : `@${profileContent?.name}`,
              `nostr:${npub}`
            )
          );
        } else if (profile.toString().startsWith("note")) {
          setContent(
            replaceNostrLinks(
              content,
              `${profile.toString().slice(0, 10)}...${profile
                .toString()
                .slice(-4)}`,
              `nostr:${profile}`
            )
          );
        } else {
          setContent(
            replaceNostrLinks(
              content,
              `${profile.toString().slice(0, 12)}...${profile
                .toString()
                .slice(-4)}`,
              `nostr:${profile}`
            )
          );
        }
      });
    }
  }, [taggedProfiles]);

  const navigate = useNavigate();

  const note = nip19.noteEncode(eventId);

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

  const isSameType = () =>
    contents.every((obj) => obj.type === contents[0].type);

  const contents = formatContent(about);

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }
    setNpubKey(nip19.npubEncode(pubkey));
    setNprofile(nip19.nprofileEncode({ pubkey: pubkey }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sats = stats.zaps?.msats ? stats.zaps.msats / 1000 : null;

  return (
    <div className={cl.post}>
      {thread && <p className={cl.replyTo}>In a thread by {thread}</p>}
      <div className={cl.postName}>
        <Link to={`/${npubKey}`}>
          <div className={cl.postImage}>
            {!imgError ? (
              picture ? (
                <img
                  src={picture}
                  alt="avatar"
                  onError={() => setImgError(true)}
                />
              ) : (
                <img alt="avatar" src={UserIcon} />
              )
            ) : (
              <img
                src={`https://media.nostr.band/thumbs/${pubkey.slice(
                  -4
                )}/${pubkey}-picture-64`}
                alt="avatar"
                onError={({ currentTarget }) => {
                  currentTarget.srcset = UserIcon;
                }}
              />
            )}
          </div>
        </Link>
        <Link className={cl.postNameLink} to={`/${npubKey}`}>
          {name}
        </Link>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item target="_blanc">
              <Link to={`/${npubKey}`} style={{ all: "unset" }}>
                Open
              </Link>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(npubKey)}>
              Copy npub
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(nprofile)}>
              Copy nprofile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyUrl(pubkey)}>
              Copy pubkey
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          navigate(`/${note}`);
        }}
      >
        <MarkdownComponent content={content} mode={""} />
      </div>
      <div className={cl.postStats}>
        {sats && (
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
        {stats.reply_count && (
          <div className={cl.postState}>
            <Chat />
            <span>{stats.reply_count}</span>
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
          <Link to={`/${note}`}>
            <span>{formatAMPM(createdDateAt.getTime())}</span>
          </Link>
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
              {isSameType() ? (
                contents[0].type === "PictureType" ? (
                  <>
                    Show <ImageFill />
                  </>
                ) : (
                  <>
                    Show <PlayBtnFill />
                  </>
                )
              ) : (
                <>
                  Show <ImageFill /> <PlayBtnFill />
                </>
              )}
            </Button>
          )
        ) : (
          ""
        )}
      </div>
      <Gallery contents={contents} isBannerVisible={isBannerVisible} />
    </div>
  );
};

export default PostItem;
