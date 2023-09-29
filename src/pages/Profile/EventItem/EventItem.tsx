import { useEffect, useState, useRef, FC, useMemo } from "react";
import cl from "./EventItem.module.css";
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
import {
  collectLinksFromStr,
  defineTypeLink,
  extractNostrStrings,
  replaceNostrLinks,
} from "../../../utils/formatLink";
import { Button, Carousel, Modal } from "react-bootstrap";
import { formatAMPM } from "../../../utils/formatDate";
import MarkdownComponent from "../../../components/MarkdownComponent/MarkdownComponent";
import UserIcon from "../../../assets/user.png";
import { nip19 } from "nostr-tools";
import { copyUrl } from "../../../utils/copy-funtions/copyFuntions";
import { useNavigate } from "react-router-dom";
import { NDKEvent } from "@nostrband/ndk";
import { statsType } from "../../../types/types";

type eventItemTypes = {
  name: string;
  picture: string;
  about: string;
  pubkey: string;
  createdDate: number;
  eventId: string;
  taggedProfiles?: (NDKEvent | string)[];
};

const EventItem: FC<eventItemTypes> = ({
  name,
  picture,
  about,
  pubkey,
  createdDate,
  eventId,
  taggedProfiles,
}) => {
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState<statsType>();
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const createdDateAt = new Date(createdDate * 1000);
  const [show, setShow] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();
  const [content, setContent] = useState(about);

  useEffect(() => {
    const contentLinks = extractNostrStrings(about);
    let newContent = about;

    if (taggedProfiles && contentLinks.length) {
      contentLinks.map((link) => {
        if (link.startsWith("npub")) {
          const pk = nip19.decode(link).data;
          const findUser = taggedProfiles.find((profile) => {
            if (profile instanceof NDKEvent) {
              return profile.pubkey === pk;
            }
          });
          if (findUser instanceof NDKEvent) {
            const profileContent = JSON.parse(findUser.content);
            const npub = nip19.npubEncode(findUser.pubkey);
            newContent = replaceNostrLinks(
              newContent,
              profileContent?.display_name
                ? `@${profileContent?.display_name}`
                : `@${profileContent?.name}`,
              `nostr:${npub}`
            );
          } else {
            newContent = replaceNostrLinks(
              newContent,
              `${link.toString().slice(0, 12)}...${link.toString().slice(-4)}`,
              `nostr:${link}`
            );
          }
        } else {
          newContent = replaceNostrLinks(
            newContent,
            `${link.toString().slice(0, 10)}...${link.toString().slice(-4)}`,
            `nostr:${link}`
          );
        }
      });
    }
    setContent(newContent);
  }, []);

  const npub = pubkey ? nip19.npubEncode(pubkey) : "";
  const nprofile = pubkey ? nip19.nprofileEncode({ pubkey: pubkey }) : "";
  const noteId = pubkey ? nip19.noteEncode(eventId) : "";

  const windowSize = useRef(window.innerWidth);

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

  type contentType = {
    type: string;
    url: string;
  };

  const isSameType = (contents: contentType[]) =>
    contents.every((obj) => obj.type === contents[0].type);

  const handleSelect = (selectedIndex: number) => {
    setCarouselIndex(selectedIndex);
  };

  let contents: contentType[] = [];
  if (about) {
    const links = collectLinksFromStr(about);
    contents = links
      .map((link) => {
        const links: contentType[] = [];
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
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sats = stats?.zaps?.msats ? stats?.zaps?.msats / 1000 : null;

  return (
    <div className={cl.post}>
      <div className={cl.postName}>
        <div className={cl.postImage}>
          {picture ? (
            !imgError ? (
              <img
                src={picture}
                alt="Profile icon"
                onError={() => setImgError(true)}
              />
            ) : (
              <img
                src={`https://media.nostr.band/thumbs/${pubkey.slice(
                  -4
                )}/${pubkey}-picture-64`}
                alt="Profile icon"
                onError={({ currentTarget }) => {
                  currentTarget.srcset = UserIcon;
                }}
              />
            )
          ) : (
            <img src={UserIcon} alt="Profile icon" />
          )}
        </div>
        <p className={cl.eventAuthorName}>{name}</p>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              href={`https://nostrapp.link/#${npub}`}
              target="_blanc"
            >
              Open
            </Dropdown.Item>
            <Dropdown.Item href="#/action-2" onClick={() => copyUrl(npub)}>
              Copy npub
            </Dropdown.Item>
            <Dropdown.Item href="#/action-3" onClick={() => copyUrl(nprofile)}>
              Copy nprofile
            </Dropdown.Item>
            <Dropdown.Item href="#/action-3" onClick={() => copyUrl(pubkey)}>
              Copy pubkey
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div style={{ cursor: "pointer" }} onClick={() => navigate(`/${noteId}`)}>
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
        {stats?.reply_count && (
          <div className={cl.postState}>
            <Chat />
            <span>{stats.reply_count}</span>
          </div>
        )}
        {stats?.repost_count && (
          <div className={cl.postState}>
            <ArrowRepeat />
            <span>
              {stats.repost_count > 1000
                ? `${Math.round(stats.repost_count / 1000)}K`
                : stats.repost_count}
            </span>
          </div>
        )}
        {stats?.reaction_count && (
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
          <span>{formatAMPM(createdDateAt.getTime())}</span>
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
              {isSameType(contents) ? (
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
                                  onClick={() => handleClose()}
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

export default EventItem;
