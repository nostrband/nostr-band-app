import { ArrowRightCircleFill } from "react-bootstrap-icons";
import cl from "./ZapTransfer.module.css";
import { formatAMPM } from "../../../utils/formatDate";
import UserIcon from "../../../assets/user.png";

const ZapTransfer = ({ sender, receiver, amount, created }) => {
  const createdAt = new Date(created * 1000);
  const data = formatAMPM(createdAt);

  return (
    <div className={cl.zap}>
      <div className={cl.zapSender}>
        <div className={cl.zapSenderAbout}>
          {sender ? (
            <div className={cl.zapSenderImage}>
              <img src={sender.picture} />
            </div>
          ) : (
            <div className={cl.zapSenderImage}>
              <img src={UserIcon} />
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
            <img src={receiver.image} />
          </div>
          <p>{receiver.displayName ? receiver.displayName : receiver.name}</p>
        </div>
      </div>
      <div className={cl.details}>
        <p>Details:</p>
      </div>
      <p className={cl.createdTime}>{data}</p>
    </div>
  );
};

export default ZapTransfer;
