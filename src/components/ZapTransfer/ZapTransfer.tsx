import {
  ArrowRight,
  ArrowRightCircleFill,
  LightningChargeFill,
} from "react-bootstrap-icons";
import cl from "./ZapTransfer.module.css";
import { formatAMPM } from "../../utils/formatDate";
import UserIcon from "../../assets/user.png";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";
import { Link } from "react-router-dom";
import { nip19 } from "nostr-tools";
import Skeleton from "react-loading-skeleton";
import { FC } from "react";
import { profileType } from "../../types/types";

type zapTypes = {
  sender: profileType;
  receiver: profileType;
  amount: number;
  created: number;
  comment: string;
  zappedPost: string;
  provider: profileType;
  senderPubkey: string;
  eventId: string;
  mode: string;
};

const ZapTransfer: FC<zapTypes> = ({
  sender,
  receiver,
  amount,
  created,
  comment,
  zappedPost,
  provider,
  senderPubkey,
  eventId,
  mode,
}) => {
  const createdAt = new Date(created * 1000);
  const data = formatAMPM(createdAt.getTime());
  const senderPk = nip19.npubEncode(senderPubkey);

  const noteId = eventId ? nip19.noteEncode(eventId) : "";

  const senderImage = sender
    ? mode === "sent"
      ? sender.image
      : sender.picture
    : "";

  return (
    <div className={cl.zap}>
      <div className={cl.zapSender}>
        <div className={cl.zapSenderAbout}>
          {senderImage ? (
            <div className={cl.zapSenderImage}>
              <img
                src={senderImage}
                onError={({ currentTarget }) =>
                  (currentTarget.srcset = UserIcon)
                }
                alt="avatar"
              />
            </div>
          ) : (
            <div className={cl.zapSenderImage}>
              <Skeleton circle width="100%" height="100%" />
            </div>
          )}
          {sender ? (
            mode === "sent" ? (
              <Link className={cl.zapsSenderName} to={`/${senderPk}`}>
                {sender.display_name ? sender.display_name : sender.name}
              </Link>
            ) : (
              <Link to={`/${senderPk}`} className={cl.zapsSenderName}>
                {sender.display_name ? sender.display_name : sender.name}
              </Link>
            )
          ) : (
            <span className={cl.unknownUser}>Unknown</span>
          )}
        </div>
        <div className={cl.zapsAmount}>
          <LightningChargeFill
            color="yellow"
            stroke="orange"
            width="1.5rem"
            height="100%"
          />
          <span>
            {amount ? (
              <>
                {amount / 1000}
                <br />
                sats
              </>
            ) : (
              <Skeleton width={30} />
            )}
          </span>
          <ArrowRightCircleFill color="orange" width="1.8rem" height="100%" />
        </div>
        <div className={`${cl.zapSenderAbout} ${cl.rightSender}`}>
          <div className={cl.zapSenderImage}>
            {receiver ? (
              receiver.image ? (
                <img
                  src={receiver.image}
                  alt="avatar"
                  onError={({ currentTarget }) =>
                    (currentTarget.srcset = UserIcon)
                  }
                />
              ) : receiver.picture ? (
                <img
                  src={receiver.picture}
                  alt="avatar"
                  onError={({ currentTarget }) =>
                    (currentTarget.srcset = UserIcon)
                  }
                />
              ) : (
                <img src={UserIcon} alt="avatar" />
              )
            ) : (
              ""
            )}
          </div>
          {receiver ? (
            mode === "sent" ? (
              <Link to={`/${senderPk}`} className={cl.zapsSenderName}>
                {receiver.display_name ? receiver.display_name : receiver.name}
              </Link>
            ) : (
              <Link className={cl.zapsSenderName} to={`/${senderPk}`}>
                {receiver.display_name ? receiver.display_name : receiver.name}
              </Link>
            )
          ) : (
            <span className={cl.unknownUser}>Unknown</span>
          )}
        </div>
      </div>
      {zappedPost && (
        <p>
          Zapped for: "{zappedPost.slice(0, 25)}...
          <Link to={`/${noteId}`}>
            <ArrowRight fontWeight={900} />
          </Link>
          "
        </p>
      )}
      {comment && <MarkdownComponent content={comment} mode="" />}
      <div className={cl.createdTime}>
        {created ? (
          data
        ) : (
          <Skeleton width={100} style={{ marginRight: "5px" }} />
        )}{" "}
        {provider && "to"}&nbsp;
        {provider && (
          <Link to={""}>
            {provider.display_name ? provider.display_name : provider.name}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ZapTransfer;
