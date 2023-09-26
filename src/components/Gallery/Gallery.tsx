import cl from "./Gallery.module.css";
import { Carousel, Modal } from "react-bootstrap";
import { FC, useRef, useState } from "react";
import { X } from "react-bootstrap-icons";
import { contentType } from "../../types/types";

type galleryType = {
  contents: contentType[];
  isBannerVisible: boolean;
};

const Gallery: FC<galleryType> = ({ contents, isBannerVisible }) => {
  const [show, setShow] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setCarouselIndex(selectedIndex);
  };

  const handleClose = () => setShow(false);
  const handleShow = (index: number) => {
    setShow(true);
    setCarouselIndex(index);
  };

  const windowSize = useRef(window.innerWidth);

  return (
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
                  onClick={() => handleShow(index)}
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
  );
};

export default Gallery;
