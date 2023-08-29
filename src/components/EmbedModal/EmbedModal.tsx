import cl from "./EmbedModal.module.css";
import { FC, useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { X } from "react-bootstrap-icons";
import ReactModal from "react-modal";
import { Button } from "react-bootstrap";
import { copyUrl } from "../../utils/copy-funtions/copyFuntions";

type ModalType = {
  setIsModal: (a: boolean) => void;
  isModal: boolean;
  str: string;
};

const EmbedModal: FC<ModalType> = ({ setIsModal, isModal, str }) => {
  const closeModal = () => setIsModal(false);
  const [embedValue] = useState<string>(
    `<div id="nostr-embed-${str}"></div><script>  !(function () {    const n=document.createElement('script');n.type='text/javascript';n.async=!0;n.src='https://cdn.jsdelivr.net/gh/nostrband/nostr-embed@0.1.16/dist/nostr-embed.js';    n.onload=function () {      nostrEmbed.init(        '${str}',        '#nostr-embed-${str}',        '',        {showZaps: true, showFollowing: true}      );    };const a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(n, a);  })();</script>`
  );
  const [frameEmbedValue] = useState<string>(`https://nostr.band/${str}?embed`);

  return (
    <ReactModal
      onAfterOpen={() => {
        document.body.style.overflow = "hidden";
      }}
      onAfterClose={() => {
        document.body.style.overflow = "auto";
      }}
      ariaHideApp={false}
      className={cl.modal}
      style={{ overlay: { zIndex: 6 } }}
      contentLabel="Embed"
      isOpen={isModal}
      onRequestClose={closeModal}
    >
      <div className={cl.modalHeader}>
        <h4>Embed note into any web page</h4>
        <Button
          variant="link"
          style={{ fontSize: "1.5rem", color: "black" }}
          onClick={closeModal}
        >
          <X />
        </Button>
      </div>
      <div className={cl.modalBody}>
        <p className={cl.embedLabel}>Embed as widget:</p>
        <InputGroup className="mb-3">
          <Form.Control
            aria-describedby="basic-addon2"
            readOnly
            value={embedValue}
          />
          <Button
            variant="outline-primary"
            id="button-addon2"
            onClick={() => copyUrl(embedValue)}
          >
            Copy
          </Button>
        </InputGroup>
        <small className={cl.muted}>
          <p>
            Paste this code into your page, right where you'd like to see that
            Nostr post or profile.
          </p>
          <p>
            For more options or a preview, click{" "}
            <a href={`https://embed.nostr.band/?q=${str}`} id="embed-link">
              here
            </a>
            .
          </p>
          <p>
            The embed widget is open-source, you can help{" "}
            <a href="https://github.com/nostrband/nostr-embed" target="_blank">
              improve
            </a>{" "}
            it.
          </p>
        </small>
      </div>
      <div style={{ marginTop: "2.4rem" }}>
        <p className={cl.embedLabel}>Embed in iframe (for Notion, etc.):</p>
        <InputGroup className="mb-3">
          <Form.Control
            aria-describedby="basic-addon2"
            readOnly
            value={frameEmbedValue}
          />
          <Button
            variant="outline-primary"
            id="button-addon2"
            onClick={() => copyUrl(frameEmbedValue)}
          >
            Copy
          </Button>
        </InputGroup>
        <small className={cl.muted}>
          <p>
            Paste this url into Notion or use inside an iframe on any webpage.
            This method is <strong>not recommended</strong>, as it will download
            the note from Nostr.Band, instead of talking directly to the Nostr
            network. Only use if you can't use the widget.
          </p>
        </small>
      </div>
    </ReactModal>
  );
};

export default EmbedModal;
