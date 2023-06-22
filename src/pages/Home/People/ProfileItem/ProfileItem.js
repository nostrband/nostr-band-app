import "./ProfileItem.css";
import Dropdown from "react-bootstrap/Dropdown";
import {
  CheckCircle,
  Key,
  Twitter,
  ZoomIn,
  BoxArrowUpRight,
  PersonPlus,
  BookmarkPlus,
} from "react-bootstrap-icons";
import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { nip19 } from "nostr-tools";

const ProfileItem = ({
  img,
  name,
  bio,
  pubKey,
  twitter,
  mail,
  newFollowersCount,
}) => {
  const [stats, setStats] = useState({});
  const [npubKey, setNpubKey] = useState("");
  const splitedMail = mail && mail.split("");
  const findMailIndex = mail && splitedMail.findIndex((m) => m === "@");
  const mailName = mail && splitedMail.slice(0, findMailIndex).join("");
  const mailAdress = mail && splitedMail.slice(findMailIndex + 1).join("");

  const fetchStats = async () => {
    const { data } = await axios.get(
      `https://api.nostr.band/v0/stats/profile/${pubKey}`
    );
    setStats(data.stats[pubKey]);
  };
  useEffect(() => {
    fetchStats();
    setNpubKey(nip19.npubEncode(pubKey));
  }, []);

  return (
    <div className="profile">
      <div className="profile-info">
        {img && (
          <div className="profile-info__image">
            <img src={img} alt="Profile icon" />
          </div>
        )}

        <div className="profile-info__hero">
          <div className="profile-info__hero-header">
            <a href="#" className="profile-info__hero-name">
              {name}
            </a>
            <Dropdown id="profile-dropdown" className="profile-dropdown">
              <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Go to app...</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Copy npub</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Copy nprofile</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Copy pubkey</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="profile-info__hero-keys">
            {mail && (
              <a className="profile-info__hero-keys-mail">
                {mailName === "_" ? mailName.replace("_", "") : mailName}
                <CheckCircle />
                {mailAdress}
              </a>
            )}
            {twitter && (
              <a
                className="profile-info__hero-keys-twitter"
                href={`https://twitter.com/${twitter}`}
              >
                <Twitter />
                {twitter}
              </a>
            )}
            <a className="profile-info__hero-keys-key">
              <Key /> {npubKey.slice(0, 8)}...{npubKey.slice(-4)}
            </a>
          </div>
          <div className="profile-info__hero-sats">
            {stats?.zaps_received?.msats && (
              <p>
                <span>
                  {String(stats?.zaps_received?.msats).slice(0, 2)}.
                  {String(stats?.zaps_received?.msats).slice(2, 3)}K
                </span>{" "}
                sats received
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-content__bio">
          <p>{bio}</p>
        </div>
        <div className="profile-content__stats">
          <p>
            <span>{stats.pub_following_pubkey_count}</span> Following
            &nbsp;&nbsp;<span>{stats.followers_pubkey_count}</span> Followers
            <span className="new-followers">&nbsp;+{newFollowersCount}</span>
          </p>
        </div>
      </div>

      <div className="profile-content__control" id="profile-buttons">
        <Button variant="secondary">
          <ZoomIn /> View
        </Button>
        <Button variant="secondary">
          <BoxArrowUpRight /> Open
        </Button>
        <Button variant="secondary">
          <PersonPlus /> Follow
        </Button>
        <Button variant="secondary">
          <BookmarkPlus /> List
        </Button>
      </div>
    </div>
  );
};

export default ProfileItem;
