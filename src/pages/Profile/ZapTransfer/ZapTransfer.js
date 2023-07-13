import {
  ArrowRight,
  Lightning,
  LightningChargeFill,
} from "react-bootstrap-icons";
import cl from "./ZapTransfer.module.css";
import { formatAMPM } from "../../../utils/formatDate";
import UserIcon from "../../../assets/user.png";
import MarkdownComponent from "../../../components/MarkdownComponent/MarkdownComponent";
import { Link } from "react-router-dom";

const ZapTransfer = ({
  sender,
  receiver,
  amount,
  created,
  comment,
  zappedPost,
}) => {
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
          <LightningChargeFill
            color="yellow"
            stroke="orange"
            width="1.5rem"
            height="100%"
          />
          <span>
            {amount / 1000} <br />
            sats
          </span>
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
      {zappedPost && (
        <p>
          Zapped for: "{zappedPost.slice(0, 25)}...
          <Link>
            <ArrowRight fontWeight={900} />
          </Link>
          "
        </p>
      )}
      {comment && (
        <p>
          Comment: <MarkdownComponent content={comment} />
        </p>
      )}
      <p className={cl.createdTime}>{data}</p>
    </div>
  );
};

export default ZapTransfer;
