import { useState } from "react";
import cl from "./Reply.module.css";
import UserIcon from "../../assets/user.png";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import MarkdownComponent from "../MarkdownComponent/MarkdownComponent";

const Reply = ({ author, content }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={cl.reply}>
      <div className={cl.replyAuthorName}>
        <div className={cl.replyAuthorImage}>
          {!imgError ? (
            author.picture ? (
              <img
                src={author.picture}
                alt="avatar"
                onError={() => setImgError(true)}
              />
            ) : (
              <img alt="avatar" src={UserIcon} />
            )
          ) : (
            <img
              src={`https://media.nostr.band/thumbs/${"pubkey".slice(
                -4
              )}/${"pubkey"}-picture-64`}
              alt="avatar"
              onError={({ currentTarget }) => {
                currentTarget.srcset = UserIcon;
              }}
            />
          )}
        </div>
        <Link className={cl.replyAuthoNameLink} to={`/}`}>
          {author.display_name ? author.display_name : author.name}
        </Link>
        <Dropdown id="profile-dropdown" className="profile-dropdown">
          <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item target="_blanc" href={`https://nostrapp.link/#`}>
              Open
            </Dropdown.Item>
            <Dropdown.Item>Copy npub</Dropdown.Item>
            <Dropdown.Item>Copy nprofile</Dropdown.Item>
            <Dropdown.Item>Copy pubkey</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div>
        <MarkdownComponent content={content} />
      </div>
    </div>
  );
};

export default Reply;
