import { ArrowRightCircleFill } from "react-bootstrap-icons";
import cl from "./ZapTransfer.module.css";
import { formatAMPM } from "../../../utils/formatDate";
import UserIcon from "../../../assets/user.png";
import MarkdownComponent from "../../../components/MarkdownComponent/MarkdownComponent";

const ZapTransfer = ({ sender, receiver, amount, created, comment }) => {
  const createdAt = new Date(created * 1000);
  const data = formatAMPM(createdAt);

  return (
    <div className={cl.zap}>
      <div className={cl.zapSender}>
        <div className={cl.zapSenderAbout}>
          {sender.picture ? (
            <div className={cl.zapSenderImage}>
              <img
                src={sender.picture}
                onError={({ currentTarget }) =>
                  (currentTarget.srcset = UserIcon)
                }
                alt="avatar"
              />
            </div>
          ) : (
            <div className={cl.zapSenderImage}>
              <img
                src={UserIcon}
                alt="avatar"
                onError={({ currentTarget }) =>
                  (currentTarget.srcset = UserIcon)
                }
              />
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
            <img
              src={receiver.image}
              alt="avatar"
              onError={({ currentTarget }) => (currentTarget.srcset = UserIcon)}
            />
          </div>
          <p>{receiver.displayName ? receiver.displayName : receiver.name}</p>
        </div>
      </div>
      {comment && <MarkdownComponent content={comment} />}
      <p className={cl.createdTime}>{data}</p>
    </div>
  );
};

export default ZapTransfer;
