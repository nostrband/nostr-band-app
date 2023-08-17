import "./ProfileItem.css";
import Dropdown from "react-bootstrap/Dropdown";
import {
  CheckCircle,
  Key,
  ZoomIn,
  BoxArrowUpRight,
  PersonPlus,
  BookmarkPlus,
} from "react-bootstrap-icons";
import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { nip19 } from "nostr-tools";
import { Link } from "react-router-dom";
import UserIcon from "../../assets/user.png";
import { copyUrl } from "../../utils/copy-funtions/copyFuntions";
import { getAllTags } from "../../utils/getTags";
import { useSelector } from "react-redux";

const ProfileItem = ({ img, name, bio, pubKey, mail, newFollowersCount }) => {
  const store = useSelector((store) => store.userReducer);
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState({});
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
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
    setNprofile(nip19.nprofileEncode({ pubkey: pubKey }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagsP = getAllTags(store.contacts?.tags, "p");
  const followedPubkeys = tagsP.length ? tagsP.map((tag) => tag[1]) : [];

  const sats = stats?.zaps_received?.msats / 1000;

  return (
    <div className="profile">
      <div className="profile-info">
        {img && (
          <Link to={`/${npubKey}`}>
            <div className="profile-info__image">
              {!imgError ? (
                <img
                  src={img}
                  alt="Profile icon"
                  onError={() => setImgError(true)}
                />
              ) : (
                <img
                  src={`https://media.nostr.band/thumbs/${pubKey.slice(
                    -4
                  )}/${pubKey}-picture-64`}
                  alt="Profile icon"
                  onError={({ currentTarget }) => {
                    currentTarget.srcset = UserIcon;
                  }}
                />
              )}
            </div>
          </Link>
        )}

        <div className="profile-info__hero">
          <div className="profile-info__hero-header">
            <Link
              to={`/${npubKey}`}
              href="http://localhost:3000/"
              className="profile-info__hero-name"
            >
              {name}
            </Link>
            <Dropdown id="profile-dropdown" className="profile-dropdown">
              <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  target="_blanc"
                  href={`https://nostrapp.link/#${npubKey}`}
                >
                  Open
                </Dropdown.Item>
                <Dropdown.Item onClick={() => copyUrl(npubKey)}>
                  Copy npub
                </Dropdown.Item>
                <Dropdown.Item onClick={() => copyUrl(nprofile)}>
                  Copy nprofile
                </Dropdown.Item>
                <Dropdown.Item onClick={() => copyUrl(pubKey)}>
                  Copy pubkey
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="profile-info__hero-keys">
            {mail && (
              <a
                href={`http://localhost:3000/?trending=people`}
                className="profile-info__hero-keys-mail"
              >
                {mailName === "_"
                  ? mailName.replace("_", "")
                  : mailName.slice(0, 4)}
                ...
                <CheckCircle />
                {mailAdress.slice(-10)}
              </a>
            )}
            {/* {twitter && (
              <a
                className="profile-info__hero-keys-twitter"
                href={`https://twitter.com/${twitter}`}
              >
                <Twitter />
                {twitter}
              </a>
            )} */}
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
                  {Number(sats) > 1000000
                    ? `${Math.round(sats / 1000000)}M`
                    : Number(sats) >= 1000
                    ? `${Math.round(sats / 1000)}K`
                    : sats}
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
            <span>
              {stats.pub_following_pubkey_count
                ? stats.pub_following_pubkey_count
                : 0}
            </span>{" "}
            Following &nbsp;&nbsp;
            <span>
              {stats.followers_pubkey_count ? stats.followers_pubkey_count : 0}
            </span>{" "}
            Followers
            {newFollowersCount && (
              <span className="new-followers">&nbsp;+{newFollowersCount}</span>
            )}
          </p>
        </div>
      </div>

      <div className="profile-content__control" id="profile-buttons">
        <Button variant="secondary">
          <ZoomIn /> View
        </Button>
        <a target="_blanc" href={`https://nostrapp.link/#${npubKey}`}>
          <Button variant="secondary">
            <BoxArrowUpRight /> Open
          </Button>
        </a>
        {followedPubkeys.includes(pubKey) ? (
          <Button variant="secondary">
            <PersonPlus /> Unfollow
          </Button>
        ) : (
          <Button variant="secondary">
            <PersonPlus /> Follow
          </Button>
        )}
        <Button variant="secondary">
          <BookmarkPlus /> List
        </Button>
      </div>
    </div>
  );
};

export default ProfileItem;
