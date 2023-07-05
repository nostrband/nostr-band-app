import { useParams } from "react-router-dom";
import cl from "./Profile.module.css";
import NDK from "@nostr-dev-kit/ndk";
import { useEffect, useState } from "react";
import Search from "../../components/Search/Search";
import {
  Key,
  TextCenter,
  BoxArrowUpRight,
  BookmarkPlus,
  PersonPlus,
  Share,
  FileEarmarkPlus,
  Lightning,
  ChatDots,
  ReplyAll,
  Chat,
} from "react-bootstrap-icons";
import axios from "axios";
import { formatAMPM } from "../../utils/formatDate";
import { Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import MarkdownComponent from "../../components/MarkdownComponent/MarkdownComponent";

const Profile = () => {
  const [pubkey, setPubkey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState("");
  const [profile, setProfile] = useState("");
  const { npub } = useParams();
  const [stats, setStats] = useState([]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
      ndk.connect();
      const user = ndk.getUser({ npub });
      await user.fetchProfile();
      const pk = user.hexpubkey();
      setPubkey(pk);
      console.log(pk);
      fetchStats(pk);
      const lastEv = await ndk.fetchEvent({
        kinds: [1],
        authors: [pk],
        limit: 1,
      });
      setLastEvent(lastEv);
      console.log(user.profile);
      setProfile(user.profile);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (pk) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/profile/${pk}`
      );
      setStats(data.stats[pk]);
      console.log(data.stats[pk]);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const sats = stats?.zaps_received?.msats / 1000;

  //   console.log(npub);

  return (
    <div className={cl.profileContainer}>
      <Search />
      <h2>Profile</h2>
      <div className={cl.profile}>
        <div className={cl.profileTitle}>
          <div className={cl.profileTitleAvatar}>
            <a href={profile.image} target="_blanc">
              <img
                src={profile.image}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null;
                  currentTarget.src = `https://media.nostr.band/thumbs/${pubkey.slice(
                    -4
                  )}/${pubkey}-picture-64`;
                }}
              />
            </a>
          </div>
          <div className={cl.profileInfo}>
            <p className={cl.profileInfoName}>{profile.displayName}</p>
            <p>
              <Key /> {npub.slice(0, 8)}...{npub.slice(-4)}
            </p>
            {profile.nip05 && (
              <p>
                <TextCenter /> {profile.nip05}
              </p>
            )}
          </div>
        </div>
        <div className={cl.profileAbout}>
          <MarkdownComponent content={profile.about} />
        </div>
        <div className={cl.profileStats}>
          <p>
            <span>{stats.pub_following_pubkey_count}</span> Following
            &nbsp;&nbsp;<span>{stats.followers_pubkey_count}</span> Followers
          </p>
        </div>
        <div className={cl.profileZaps}>
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
        <div className={cl.lastActive}>
          <p>
            Last active: {formatAMPM(new Date(lastEvent.created_at * 1000))}
          </p>
        </div>
        <div className={`${cl.profileContentControl} ${cl.profileButtons}`}>
          <Button variant="secondary">
            <BoxArrowUpRight /> Open
          </Button>
          <Button variant="secondary">
            <Lightning /> Zap
          </Button>
          <Button variant="secondary">
            <PersonPlus /> Follow
          </Button>
          <Button variant="secondary">
            <BookmarkPlus /> List
          </Button>
          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-basic"
              style={{ alignItems: "center" }}
            >
              Menu
            </Dropdown.Toggle>

            <Dropdown.Menu id={cl["menu-id"]}>
              <Dropdown.Item href="#/action-1">
                <BoxArrowUpRight /> Open with
              </Dropdown.Item>
              <Dropdown.Item href="#/action-2">
                <Share /> Share
              </Dropdown.Item>
              <Dropdown.Item href="#/action-3">
                <FileEarmarkPlus /> Embed
              </Dropdown.Item>
              <hr />
              <Dropdown.Item href="#/action-1">Copy npub</Dropdown.Item>
              <Dropdown.Item href="#/action-1">Copy nprofile</Dropdown.Item>
              <Dropdown.Item href="#/action-1">Copy pubkey</Dropdown.Item>
              <Dropdown.Item href="#/action-1">
                Copy contact list naddr
              </Dropdown.Item>
              <hr />
              <Dropdown.Item href="#/action-1">View home feed</Dropdown.Item>
              <Dropdown.Item href="#/action-1">View edit history</Dropdown.Item>
              <Dropdown.Item href="#/action-1">View relays</Dropdown.Item>
              <Dropdown.Item href="#/action-1">View profile JSON</Dropdown.Item>
              <Dropdown.Item href="#/action-1">
                View contacts JSON
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className={cl.showMore}>
          <a className={cl.showMoreLink}>
            Discussions{" "}
            <strong>({stats.pub_post_count + stats.pub_reply_count})</strong>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
