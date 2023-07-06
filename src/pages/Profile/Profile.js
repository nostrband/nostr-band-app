import { Link, useParams } from "react-router-dom";
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
} from "react-bootstrap-icons";
import axios from "axios";
import { formatAMPM } from "../../utils/formatDate";
import { Button } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import MarkdownComponent from "../../components/MarkdownComponent/MarkdownComponent";
import EventItem from "./EventItem/EventItem";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ProfileSkeleton from "./ProfileSkeleton/ProfileSkeleton";

const Profile = () => {
  const [pubkey, setPubkey] = useState("");
  const [lastEvent, setLastEvent] = useState("");
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState("");
  const { npub } = useParams();
  const [stats, setStats] = useState([]);
  const [ndk, setNdk] = useState({});
  const [tabKey, setTabKey] = useState("posts");

  const fetchUser = async () => {
    try {
      const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
      ndk.connect();
      const user = ndk.getUser({ npub });
      await user.fetchProfile();
      const pk = user.hexpubkey();
      setPubkey(pk);
      // console.log(pk);
      fetchStats(pk);
      const lastEv = await ndk.fetchEvent({
        kinds: [1],
        authors: [pk],
        limit: 1,
      });
      const events = await ndk.fetchEvents({
        kinds: [1],
        authors: [pk],
        limit: 10,
      });
      console.log(Array.from(events));
      setEvents(Array.from(events));
      setLastEvent(lastEv);
      // console.log(user.profile);
      setProfile(user.profile);
      setNdk(ndk);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchStats = async (pk) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/profile/${pk}`
      );
      setStats(data.stats[pk]);
      // console.log(data.stats[pk]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tabKey === "zaps") {
      fetchZaps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey]);

  const fetchZaps = async (pk) => {
    const zaps = await ndk.fetchEvents({
      kinds: [9735],
      authors: [pk],
      limit: 10,
    });
    console.log(zaps);
  };

  const sats = stats?.zaps_received?.msats / 1000;

  //   console.log(npub);

  return (
    <div className={cl.profileContainer}>
      <Search />
      <h2>Profile</h2>
      {profile ? (
        <>
          <div className={cl.profile}>
            <div className={cl.profileTitle}>
              <div className={cl.profileTitleAvatar}>
                <a href={profile.image} target="_blanc">
                  <img
                    alt="Avatar"
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
                &nbsp;&nbsp;<span>{stats.followers_pubkey_count}</span>{" "}
                Followers
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
                  <Dropdown.Item href="#/action-1">
                    View home feed
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-1">
                    View edit history
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-1">View relays</Dropdown.Item>
                  <Dropdown.Item href="#/action-1">
                    View profile JSON
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-1">
                    View contacts JSON
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className={cl.showMore}>
              <Link className={cl.showMoreLink}>
                Discussions{" "}
                <strong>
                  ({stats.pub_post_count + stats.pub_reply_count})
                </strong>
              </Link>
            </div>
          </div>
          <div className={cl.userEvents}>
            <Tabs
              activeKey={tabKey}
              onSelect={(k) => setTabKey(k)}
              defaultActiveKey="profile"
              id="justify-tab-example"
              className="mb-3"
              justify
            >
              <Tab eventKey="posts" title="Posts">
                {events && events.length
                  ? events.map((event) => {
                      return (
                        <EventItem
                          key={event.id}
                          createdDate={event.created_at}
                          about={event.content}
                          pubkey={event.pubkey}
                          eventId={event.id}
                          picture={profile.image}
                          name={profile.displayName}
                        />
                      );
                    })
                  : ""}
              </Tab>
              <Tab
                eventKey="zaps"
                title="Zaps"
                onClick={() => fetchZaps(pubkey)}
              >
                Tab content for Profile
              </Tab>
              <Tab eventKey="longer-tab" title="Loooonger Tab">
                Tab content for Loooonger Tab
              </Tab>
            </Tabs>
          </div>
        </>
      ) : (
        <ProfileSkeleton />
      )}
    </div>
  );
};

export default Profile;
