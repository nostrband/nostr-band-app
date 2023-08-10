import { useEffect, useState, useRef } from "react";
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
import { collectLinksFromStr, defineTypeLink } from "../../utils/formatLink";
import { Button, Carousel, Modal } from "react-bootstrap";
import { formatAMPM } from "../../utils/formatDate";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";
import UserIcon from "../../assets/user.png";
import { Link, useNavigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import {
  copyNprofile,
  copyNpub,
  copyPubkey,
} from "../../utils/copy-funtions/copyFuntions";
import NDK from "@nostrband/ndk";

const PostItem = ({
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
  const [stats, setStats] = useState([]);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const createdDateAt = new Date(createdDate * 1000);
  const [show, setShow] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [taggedProfiles, setTaggedProfiles] = useState([]);
  const [content, setContent] = useState(about);

  function extractNostrStrings(inputString) {
    const nostrPattern = /nostr:[^\s.,:]+/g;
    const matches = inputString.match(nostrPattern);

    if (matches) {
      return matches.map((match) => match.slice("nostr:".length));
    } else {
      return [];
    }
  }

  const fetchProfiles = async (pubkeys) => {
    const profiles = Array.from(
      await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
    );
    setTaggedProfiles(profiles.length ? profiles : pubkeys);
  };

  if (content) {
    const links = extractNostrStrings(content);
    if (links) {
      const pubkeys = links.map((link) => {
        if (link.startsWith("npub")) {
          return nip19.decode(link).data;
        }
        return link;
      });
      if (ndk instanceof NDK) {
        fetchProfiles(pubkeys);
      }
    }
  }
  function replaceNostrLinks(inputText, replacementText, pattern) {
    const nostrPattern = pattern;
    return inputText
      .toString()
      ?.replace(
        nostrPattern,
        `[@${replacementText}](/${pattern.split(":")[1]})`
      );
  }

  useEffect(() => {
    if (taggedProfiles) {
      taggedProfiles.map((profile) => {
        if (!profile.toString().startsWith("note")) {
          const profileContent = JSON.parse(profile.content);
          const npub = nip19.npubEncode(profile.pubkey);
          setContent(
            replaceNostrLinks(
              content,
              profileContent?.display_name
                ? profileContent?.display_name
                : profileContent?.name,
              `nostr:${npub}`
            )
          );
        } else {
          setContent(
            replaceNostrLinks(
              content,
              `${profile.toString().slice(0, 10)}...${profile
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

  const windowSize = useRef(window.innerWidth);
  const note = nip19.noteEncode(eventId);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

  const handleSelect = (selectedIndex) => {
    setCarouselIndex(selectedIndex);
  };

  let contents = "";
  if (about) {
    const links = collectLinksFromStr(about);
    contents = links
      .map((link) => {
        const links = [];
        const obj = defineTypeLink(link);
        if (obj) {
          if (obj.type !== "NotMedia" && obj.type) {
            links.push(obj);
          }
        }
        return links ? links : [];
      })
      .flat();
  }

  useEffect(() => {
    if (eventId) {
      fetchStats();
    }
    setNpubKey(nip19.npubEncode(pubkey));
    setNprofile(nip19.nprofileEncode({ pubkey: pubkey }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sats = stats?.zaps?.msats / 1000;

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
            <Dropdown.Item onClick={() => copyNpub(npubKey)}>
              Copy npub
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyNprofile(nprofile)}>
              Copy nprofile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyPubkey(pubkey)}>
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
        <MarkdownComponent content={content} />
      </div>
      <div className={cl.postStats}>
        {stats?.zaps?.msats && (
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
      <div className={cl.bannerWrapper}>
        {isBannerVisible && contents.length
          ? contents.map((content, index) => {
              return content.type === "AudioType" ? (
                <div key={index} className={cl.banner}>
                  <audio
                    className="audio-content"
                    src={content.url}
                    controls
                    preload="metadata"
                  />
                </div>
              ) : content.type === "YouTubeType" ? (
                <div key={index} className={cl.bannerMovie}>
                  <iframe
                    title="youtube"
                    id="ytplayer"
                    className="youtube-fram"
                    type="text/html"
                    width="640"
                    height="360"
                    src={content.url}
                  />
                </div>
              ) : content.type === "MovieType" ? (
                <div key={index} className={cl.bannerMovie}>
                  <video
                    className="video-wrapper"
                    src={content.url}
                    controls
                    preload="metadata"
                  />
                </div>
              ) : content.type === "PictureType" ? (
                <div key={index} className={cl.banner}>
                  <img
                    alt="content"
                    width="100%"
                    className="content-image"
                    src={content.url}
                    onClick={handleShow}
                  />
                  <Modal
                    className={cl.modal}
                    centered
                    show={show}
                    onHide={handleClose}
                  >
                    {contents.length <= 1 ? (
                      <div className={`${cl.modalContainer}`}>
                        <X onClick={handleClose} className={cl.modalClose} />
                        <img src={content.url} alt="content" />
                      </div>
                    ) : (
                      <Carousel
                        fade
                        interval={null}
                        activeIndex={carouselIndex}
                        onSelect={handleSelect}
                        controls={windowSize.current <= 500 ? false : true}
                        className={cl.carousel}
                      >
                        {contents.map((img, index) => {
                          return (
                            <Carousel.Item
                              key={index}
                              className={cl.carouselItem}
                            >
                              <div className={cl.carouselItemWrapper}>
                                <X
                                  onClick={(e) => handleClose(e)}
                                  className={cl.modalClose}
                                />
                                <img
                                  src={img.url}
                                  alt="content"
                                  style={{
                                    width: "100%",
                                    display: "block",
                                    height: "auto",
                                  }}
                                />
                              </div>
                            </Carousel.Item>
                          );
                        })}
                      </Carousel>
                    )}
                  </Modal>
                </div>
              ) : (
                ""
              );
            })
          : ""}
      </div>
    </div>
  );
};

export default PostItem;
