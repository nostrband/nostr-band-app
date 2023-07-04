import { useRef } from "react";
import MarkdownComponent from "../../../../components/MarkdownComponent/MarkdownComponent";
import {
  collectLinksFromStr,
  defineTypeLink,
} from "../../../../utils/formatLink";
import cl from "./ImageItem.module.css";
import Dropdown from "react-bootstrap/Dropdown";
import { Button, Carousel, Modal } from "react-bootstrap";
import { useState } from "react";
import { ImageFill, PlayBtnFill, X } from "react-bootstrap-icons";
import { formatAMPM } from "../../../../utils/formatDate";

const ImageItem = ({ name, picture, pubkey, about, createdDate }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const createdDateAt = new Date(createdDate * 1000);
  const [show, setShow] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const windowSize = useRef(window.innerWidth);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

  const isSameType = () =>
    contents.every((obj) => obj.type === contents[0].type);

  return (
    <div className={cl.image}>
      <div className={cl.imageAuthor}>
        <div className={cl.imageAuthorImage}>
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
      <div>
        <MarkdownComponent content={about} />
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
      <div className={cl.imageTime}>
        <span>{formatAMPM(createdDateAt)}</span>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#/action-1">Open</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Copy nevent</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Copy note ID</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Copy HEX</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default ImageItem;
