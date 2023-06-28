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
      `${process.env.REACT_APP_API_URL}/stats/profile/${pubKey}`
    );
    setStats(data.stats[pubKey]);
  };
  useEffect(() => {
    fetchStats();
    setNpubKey(nip19.npubEncode(pubKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <a
              href="http://localhost:3000/"
              className="profile-info__hero-name"
            >
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
              <a
                href={`mailto:${mail}`}
                className="profile-info__hero-keys-mail"
              >
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
            <a
              href="http://localhost:3000/"
              className="profile-info__hero-keys-key"
            >
              <Key /> {npubKey.slice(0, 8)}...{npubKey.slice(-4)}
            </a>
          </div>
          <div className="profile-info__hero-sats">
            {stats?.zaps_received?.msats && (
              <p>
                <span>
                  {stats?.zaps_received?.msats > 1000000
                    ? `${Math.round(stats?.zaps_received?.msats / 1000000)}M`
                    : stats?.zaps_received?.msats >= 1000
                    ? `${Math.round(stats?.zaps_received?.msats / 1000)}K`
                    : stats?.zaps_received?.msats}
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