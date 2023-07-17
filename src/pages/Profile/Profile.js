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
  ChatQuote,
  LightningFill,
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
import {
  copyNprofile,
  copyNpub,
  copyPubkey,
} from "../../utils/copy-funtions/copyFuntions";
import { nip19 } from "nostr-tools";
import { getZapAmount } from "../../utils/zapFunctions";
import ZapTransfer from "./ZapTransfer/ZapTransfer";

const Profile = () => {
  const [pubkey, setPubkey] = useState("");
  const [lastEvent, setLastEvent] = useState("");
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState("");
  const { npub } = useParams();
  const [stats, setStats] = useState([]);
  const [ndk, setNdk] = useState({});
  const [tabKey, setTabKey] = useState("posts");
  const [nprofile, setNprofile] = useState("");
  const [receivedZaps, setReceivedZaps] = useState([]);
  const [amountReceivedZaps, setAmountReceivedZaps] = useState([]);
  const [sentAuthors, setSentAuthors] = useState([]);
  const [createdTimes, setCreatedTimes] = useState([]);
  const [sendersComments, setSendersComments] = useState([]);
  const [zappedPosts, setZappedPosts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [countOfZaps, setCountOfZaps] = useState("");
  const [countOfSentZaps, setCountOfSentZaps] = useState("");
  const [countOfPosts, setCountOfPosts] = useState("");
  const [limitZaps, setLimitZaps] = useState(10);
  const [isZapLoading, setIsZapLoading] = useState(false);
  const [limitPosts, setLimitPosts] = useState(10);
  const [sentZaps, setSentZaps] = useState([]);
  const [sentProviders, setSentProviders] = useState([]);
  const [amountSentZaps, setAmountSentZaps] = useState([]);
  const [sentComments, setSentComments] = useState([]);
  const [sentCreatedTimes, setSentCreatedTimes] = useState([]);
  const [receiverAuthors, setReceiverAuthors] = useState([]);
  const [sentZappedPosts, setSentZappedPosts] = useState([]);

  const fetchUser = async () => {
    try {
      setIsZapLoading(true);
      const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
      ndk.connect();
      setNdk(ndk);
      const user = ndk.getUser({ npub });
      await user.fetchProfile();
      const pk = user.hexpubkey();
      setPubkey(pk);
      fetchStats(pk);
      const lastEv = await ndk.fetchEvent({
        kinds: [1],
        authors: [pk],
        limit: 1,
      });
      setLastEvent(lastEv);
      fetchPosts(pk, ndk);
      // console.log(user.profile);
      setProfile(user.profile);
      setNprofile(nip19.nprofileEncode({ pubkey: pk }));
      setIsZapLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchPosts = async (pk, ndk) => {
    if (ndk instanceof NDK) {
      const events = await ndk.fetchEvents({
        kinds: [1],
        authors: [pk],
        limit: limitPosts,
      });
      setEvents(Array.from(events));
    }
  };

  const fetchStats = async (pk) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/profile/${pk}`
      );
      setStats(data.stats[pk]);
      setCountOfZaps(
        data.stats[pk]?.zaps_received?.count
          ? data.stats[pk]?.zaps_received?.count
          : 0
      );
      setCountOfSentZaps(
        data.stats[pk]?.zaps_sent?.count ? data.stats[pk]?.zaps_sent?.count : 0
      );
      setCountOfPosts(
        data.stats[pk]?.pub_post_count ? data.stats[pk]?.pub_post_count : 0
      );
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
      fetchZaps(pubkey);
    } else if (tabKey === "zaps-sent") {
      fetchSentZaps(pubkey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey]);

  const fetchSentZaps = async (pk) => {
    try {
      setIsZapLoading(true);
      const zaps = Array.from(
        await ndk.fetchEvents({
          kinds: [9735],
          "@zs": [pk],
          limit: limitZaps,
        })
      );
      setSentZaps(zaps);

      const providersPubkyes = zaps.map((zap) => zap.pubkey);
      const providers = Array.from(
        await ndk.fetchEvents({
          kinds: [0],
          authors: providersPubkyes,
          limit: limitZaps,
        })
      );
      setSentProviders(providers);

      const zapsAmount = zaps.map((zap) => {
        return getZapAmount(zap);
      });
      setAmountSentZaps(zapsAmount);

      const postsIds = zaps.map((zap) => {
        return zap.tags.find((item) => item[0] === "e")
          ? zap.tags.find((item) => item[0] === "e")[1]
          : "";
      });
      const zappedPosts = Array.from(
        await ndk.fetchEvents({ kinds: [1], ids: postsIds, limit: limitZaps })
      );
      setSentZappedPosts(zappedPosts);

      const sendersComments = zaps.map((zap) => {
        const cleanJSON = zap.tags
          .find((item) => item[0] === "description")[1]
          .replace(/[^\x20-\x7E]/g, "");
        return JSON.parse(cleanJSON).content;
      });
      setSentComments(sendersComments);

      const createdTimes = zaps.map((zap) => {
        return zap.created_at;
      });
      setSentCreatedTimes(createdTimes);

      const receiversPubkeys = zaps.map((zap) => {
        return zap.tags.find((item) => item[0] === "p")[1];
      });

      const receiversArr = Array.from(
        await ndk.fetchEvents({
          kinds: [0],
          authors: receiversPubkeys,
          limit: limitZaps,
        })
      );

      const receivers = receiversArr.map((receiver) => {
        return receiver;
      });
      setReceiverAuthors(receivers);
      setIsZapLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchZaps = async (pk) => {
    try {
      setIsZapLoading(true);
      const zaps = Array.from(
        await ndk.fetchEvents({
          kinds: [9735],
          "#p": [pk],
          limit: limitZaps,
        })
      );
      setReceivedZaps(zaps);

      const providersPubkyes = zaps.map((zap) => zap.pubkey);
      const providers = Array.from(
        await ndk.fetchEvents({
          kinds: [0],
          authors: providersPubkyes,
          limit: limitZaps,
        })
      );
      setProviders(providers);

      const zapsAmount = zaps.map((zap) => {
        return getZapAmount(zap);
      });
      setAmountReceivedZaps(zapsAmount);

      const postsIds = zaps.map((zap) => {
        return zap.tags.find((item) => item[0] === "e")
          ? zap.tags.find((item) => item[0] === "e")[1]
          : "";
      });
      const zappedPosts = Array.from(
        await ndk.fetchEvents({ kinds: [1], ids: postsIds, limit: limitZaps })
      );
      setZappedPosts(zappedPosts);

      const sendersPubkeys = zaps.map((zap) => {
        const cleanJSON = zap.tags
          .find((item) => item[0] === "description")[1]
          .replace(/[^\x20-\x7E]/g, "");
        return JSON.parse(cleanJSON).pubkey;
      });
      // console.log(sendersPubkeys);

      const sendersComments = zaps.map((zap) => {
        const cleanJSON = zap.tags
          .find((item) => item[0] === "description")[1]
          .replace(/[^\x20-\x7E]/g, "");
        return JSON.parse(cleanJSON).content;
      });
      setSendersComments(sendersComments);

      const createdTimes = zaps.map((zap) => {
        return zap.created_at;
      });
      setCreatedTimes(createdTimes);

      const sendersArr = Array.from(
        await ndk.fetchEvents({
          kinds: [0],
          authors: sendersPubkeys,
          limit: limitZaps,
        })
      );
      // console.log(sendersArr);
      const senders = sendersArr.map((sender) => {
        return sender;
      });
      setSentAuthors(senders);
      setIsZapLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (tabKey === "zaps") {
      fetchZaps(pubkey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitZaps]);

  useEffect(() => {
    if (tabKey === "posts") {
      fetchPosts(pubkey, ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitPosts]);

  const getMoreZaps = () => {
    setLimitZaps((prevState) => prevState + 10);
  };

  const getMorePosts = () => {
    setLimitPosts((prevState) => prevState + 10);
  };

  const sats = stats?.zaps_received?.msats / 1000;
  const sentSats = stats.zaps_sent?.msats / 1000;

  return (
    <div className={cl.profileContainer}>
      <Search isLoading={isZapLoading} />
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
                <p className={cl.profileInfoName}>
                  {profile.displayName ? profile.displayName : profile.name}
                </p>
                <p>
                  <Key /> {npub.slice(0, 8)}...{npub.slice(-4)}
                </p>
                {profile.nip05 && (
                  <div className={cl.profileNip}>
                    <TextCenter /> <MarkdownComponent content={profile.nip05} />
                  </div>
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
              {stats?.zaps_sent?.msats && (
                <p>
                  <span>
                    {Number(sentSats) > 1000000
                      ? `${Math.round(sentSats / 1000000)}M`
                      : Number(sentSats) >= 1000
                      ? `${Math.round(sentSats / 1000)}K`
                      : sentSats}
                  </span>{" "}
                  sats sent
                </p>
              )}
            </div>
            <div className={cl.lastActive}>
              {lastEvent && (
                <p>
                  Last active:{" "}
                  {formatAMPM(new Date(lastEvent.created_at * 1000))}
                </p>
              )}
            </div>
            <div className={`${cl.profileContentControl} ${cl.profileButtons}`}>
              <a target="_blanc" href={`https://nostrapp.link/#${npub}`}>
                <Button variant="secondary">
                  <BoxArrowUpRight /> Open
                </Button>
              </a>
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
                  <Dropdown.Item
                    target="_blanc"
                    href={`https://nostrapp.link/#${npub}`}
                  >
                    <BoxArrowUpRight /> Open with
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-2">
                    <Share /> Share
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-3">
                    <FileEarmarkPlus /> Embed
                  </Dropdown.Item>
                  <hr />
                  <Dropdown.Item onClick={() => copyNpub(npub)}>
                    Copy npub
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyNprofile(nprofile)}>
                    Copy nprofile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyPubkey(pubkey)}>
                    Copy pubkey
                  </Dropdown.Item>
                  <Dropdown.Item>Copy contact list naddr</Dropdown.Item>
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
          </div>
          <div className={cl.userEvents}>
            <Tabs
              activeKey={tabKey}
              onSelect={(k) => setTabKey(k)}
              defaultActiveKey="profile"
              id="justify-tab-example"
              className={`mb-3 ${cl.tab}`}
              variant="pills"
              justify
            >
              <Tab
                eventKey="posts"
                title={
                  <span className="d-flex align-items-center">
                    <ChatQuote style={{ marginRight: "5px" }} />
                    posts&nbsp;
                    {countOfPosts}
                  </span>
                }
              >
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
                          name={
                            profile.displayName
                              ? profile.displayName
                              : profile.name
                          }
                        />
                      );
                    })
                  : "No posts"}
                {countOfPosts - events.length > 0 && (
                  <div className={cl.moreBtn}>
                    <Button
                      onClick={() => getMorePosts()}
                      disabled={isZapLoading}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </Tab>
              <Tab
                eventKey="zaps"
                title={
                  <span className="d-flex align-items-center">
                    <LightningFill />
                    received&nbsp;
                    {countOfZaps}
                  </span>
                }
                onClick={() => fetchZaps(pubkey)}
              >
                {receivedZaps.length && createdTimes.length
                  ? receivedZaps.map((author, index) => {
                      const cleanJSON = author.tags
                        .find((item) => item[0] === "description")[1]
                        .replace(/[^\x20-\x7E]/g, "");
                      const pk = JSON.parse(cleanJSON).pubkey;
                      const sender = sentAuthors.find((item) => {
                        return item.pubkey === pk;
                      });
                      const senderContent = sender
                        ? JSON.parse(sender.content)
                        : "";

                      const zappedPost = zappedPosts.find((item) => {
                        const e = author.tags.find((item) => item[0] === "e")
                          ? author.tags.find((item) => item[0] === "e")[1]
                          : "";
                        return item.id === e;
                      });

                      const pr = providers.find(
                        (provider) => provider.pubkey === author.pubkey
                      );
                      const provider = pr ? JSON.parse(pr.content) : "";

                      return (
                        <ZapTransfer
                          key={index}
                          created={createdTimes[index]}
                          sender={senderContent}
                          amount={amountReceivedZaps[index]}
                          receiver={profile}
                          comment={sendersComments[index]}
                          zappedPost={zappedPost ? zappedPost.content : ""}
                          provider={provider}
                          senderPubkey={pk}
                        />
                      );
                    })
                  : "No received zaps"}
                {countOfZaps - receivedZaps.length > 0 && (
                  <div className={cl.moreBtn}>
                    <Button
                      onClick={() => getMoreZaps()}
                      disabled={isZapLoading}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </Tab>
              <Tab
                eventKey="zaps-sent"
                title={
                  <div className="d-flex align-items-center">
                    <LightningFill />
                    sent&nbsp;
                    {countOfSentZaps}
                  </div>
                }
              >
                {sentZaps.length && sentCreatedTimes.length
                  ? sentZaps.map((author, index) => {
                      const pk = author.tags.find((item) => item[0] === "p")[1];

                      const receiver = receiverAuthors.find(
                        (item) => item.pubkey === pk
                      );

                      console.log(receiver);
                      const receiverContent = receiver
                        ? JSON.parse(receiver.content)
                        : "";

                      const zappedPost = sentZappedPosts.find((item) => {
                        const e = author.tags.find((item) => item[0] === "e")
                          ? author.tags.find((item) => item[0] === "e")[1]
                          : "";
                        return item.id === e;
                      });

                      const pr = sentProviders.find(
                        (provider) => provider.pubkey === author.pubkey
                      );
                      const provider = pr ? JSON.parse(pr.content) : "";

                      return (
                        <ZapTransfer
                          key={index}
                          created={sentCreatedTimes[index]}
                          sender={profile}
                          amount={amountSentZaps[index]}
                          receiver={receiverContent}
                          comment={sentComments[index]}
                          zappedPost={zappedPost ? zappedPost.content : ""}
                          provider={provider}
                          senderPubkey={pubkey}
                          mode="sent"
                        />
                      );
                    })
                  : "No sent zaps"}
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
