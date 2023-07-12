import { ArrowRightCircleFill } from "react-bootstrap-icons";
import cl from "./ZapTransfer.module.css";
import { formatAMPM } from "../../../utils/formatDate";
import UserIcon from "../../../assets/user.png";
import { useState } from "react";

const ZapTransfer = ({ sender, receiver, amount, created, comment }) => {
  const [imageError, setImageError] = useState(false);
  const createdAt = new Date(created * 1000);
  const data = formatAMPM(createdAt);

  return (
    <div className={cl.zap}>
      <div className={cl.zapSender}>
        <div className={cl.zapSenderAbout}>
          {sender && !imageError ? (
            <div className={cl.zapSenderImage}>
              <img
                src={sender.picture}
                onError={() => setImageError(true)}
                alt="avatar"
              />
            </div>
          ) : (
            <div className={cl.zapSenderImage}>
              <img src={UserIcon} alt="avatar" />
            </div>
          )}
          {sender ? (
            <p>{sender.displayName ? sender.displayName : sender.name}</p>
          ) : (
            "Unknown"
          )}
        </div>
        <div className={cl.zapsAmount}>
          <ArrowRightCircleFill />
          <span>{amount / 1000} sats</span>
          <ArrowRightCircleFill />
        </div>
        <div className={cl.zapSenderAbout}>
          <div className={cl.zapSenderImage}>
            <img src={receiver.image} alt="avatar" />
          </div>
          <p>{receiver.displayName ? receiver.displayName : receiver.name}</p>
        </div>
      </div>
      {comment && (
        <div className={cl.details}>
          <p>{comment}</p>
        </div>
      )}
      <p className={cl.createdTime}>{data}</p>
    </div>
  );
};

export default ZapTransfer;
