import { useLocation, useParams } from "react-router-dom";
import cl from "./Profile.module.css";
import NDK, { NDKEvent, NDKUserProfile } from "@nostrband/ndk";
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
  X,
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
import { copyLink, copyUrl } from "../../utils/copy-funtions/copyFuntions";
import { nip19 } from "nostr-tools";
import { getZapAmount } from "../../utils/zapFunctions";
import ZapTransfer from "../../components/ZapTransfer/ZapTransfer";
import UserIcon from "../../assets/user.png";
import ReactModal from "react-modal";
import EmbedModal from "../../components/EmbedModal/EmbedModal";
import { userSlice } from "../../store/reducers/UserSlice";
import { toast } from "react-toastify";
import { getAllTags } from "../../utils/getTags";
import { useNostr, dateToUnix } from "nostr-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { statsType } from "../../types/types";

const Profile = () => {
  const store = useAppSelector((store) => store.userReducer);
  const { publish } = useNostr();
  const [pubkey, setPubkey] = useState("");
  const [lastEvent, setLastEvent] = useState<NDKEvent | null>(null);
  const [events, setEvents] = useState<NDKEvent[]>([]);
  const [profile, setProfile] = useState<NDKUserProfile>();
  const { router } = useParams();
  const npub = router;
  const [stats, setStats] = useState<statsType>({});
  const [ndk, setNdk] = useState<NDK>();
  const [isPostMoreButton, setIsPostMoreButton] = useState(false);
  const [isZapMoreButton, setIsZapMoreButton] = useState(false);
  const [isSentZapMoreButton, setIsSentZapMoreButton] = useState(false);
  const [tabKey, setTabKey] = useState("posts");
  const [nprofile, setNprofile] = useState("");
  const [nnadr, setNnadr] = useState("");
  const [receivedZaps, setReceivedZaps] = useState<NDKEvent[]>([]);
  const [amountReceivedZaps, setAmountReceivedZaps] = useState<number[]>([]);
  const [sentAuthors, setSentAuthors] = useState<NDKEvent[]>([]);
  const [createdTimes, setCreatedTimes] = useState<number[]>([]);
  const [sendersComments, setSendersComments] = useState<any[]>([]);
  const [zappedPosts, setZappedPosts] = useState<NDKEvent[]>([]);
  const [providers, setProviders] = useState<NDKEvent[]>([]);
  const [countOfZaps, setCountOfZaps] = useState(0);
  const [countOfSentZaps, setCountOfSentZaps] = useState(0);
  const [countOfPosts, setCountOfPosts] = useState(0);
  const [limitZaps, setLimitZaps] = useState(10);
  const [isZapLoading, setIsZapLoading] = useState(false);
  const [limitPosts, setLimitPosts] = useState(10);
  const [sentZaps, setSentZaps] = useState<NDKEvent[]>([]);
  const [sentProviders, setSentProviders] = useState<NDKEvent[]>([]);
  const [amountSentZaps, setAmountSentZaps] = useState<number[]>([]);
  const [sentComments, setSentComments] = useState<any[]>([]);
  const [sentCreatedTimes, setSentCreatedTimes] = useState<number[]>([]);
  const [receiverAuthors, setReceiverAuthors] = useState<NDKEvent[]>([]);
  const [sentZappedPosts, setSentZappedPosts] = useState<NDKEvent[]>([]);
  const [limitSentZaps, setLimitSentZaps] = useState(10);
  const [isBottom, setIsBottom] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [profileJson, setProfileJson] = useState("");
  const [contactJson, setContactJson] = useState("");
  const [isEmbedModal, setIsEmbedModal] = useState(false);
  const location = useLocation();
  const { setContacts } = userSlice.actions;

  const dispatch = useAppDispatch();

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollBottom = scrollTop + windowHeight;
    if (scrollBottom >= documentHeight) {
      setIsBottom(true);
    } else {
      setIsBottom(false);
    }
  };

  useEffect(() => {
    if (ndk instanceof NDK) {
      setTabKey("posts");
      fetchUser(ndk);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isBottom) {
      if (tabKey === "posts") {
        if (
          events.length <= 50 &&
          countOfPosts - events.length > 0 &&
          !isZapLoading
        ) {
          getMorePosts();
        } else {
          setIsPostMoreButton(true);
        }
      } else if (tabKey === "zaps") {
        if (
          receivedZaps.length <= 50 &&
          countOfZaps - receivedZaps.length > 0 &&
          !isZapLoading
        ) {
          getMoreZaps();
        } else {
          setIsZapMoreButton(true);
        }
      } else if (tabKey === "zaps-sent") {
        if (
          sentZaps.length <= 50 &&
          countOfSentZaps - sentZaps.length > 0 &&
          !isZapLoading
        ) {
          getMoreSentZaps();
        } else {
          setIsSentZapMoreButton(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async (ndk: NDK) => {
    try {
      if (ndk instanceof NDK) {
        setIsZapLoading(true);
        const user = ndk.getUser({ npub });
        await user.fetchProfile();
        const pk = user.hexpubkey();
        setPubkey(pk);
        fetchStats(pk);
        //@ts-ignore
        const lastEv = await ndk.fetchEvent({
          kinds: [1],
          authors: [pk],
          limit: 1,
        });
        setLastEvent(lastEv);
        fetchPosts(pk, ndk);
        // console.log(user.profile);
        setProfile(user.profile);
        setProfileJson(JSON.stringify(user.profile, null, 2));
        //@ts-ignore
        const contactJson = await ndk.fetchEvent({ kinds: [3], authors: [pk] });
        setContactJson(
          JSON.stringify(
            {
              pubkey: contactJson?.pubkey,
              content: contactJson?.content,
              kind: "3",
              created_at: contactJson?.created_at,
            },
            null,
            2
          )
        );
        setNprofile(nip19.nprofileEncode({ pubkey: pk }));
        setNnadr(
          nip19.naddrEncode({
            kind: 3,
            pubkey: pk,
            identifier: "",
            relays: ["wss://relay.nostr.band"],
          })
        );
        setIsZapLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchPosts = async (pk: string, ndk: NDK) => {
    if (ndk instanceof NDK) {
      try {
        setIsZapLoading(true);
        const events = await ndk.fetchEvents({
          kinds: [1],
          authors: [pk],
          limit: limitPosts,
        });
        setEvents(Array.from(events));
        setIsZapLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const fetchStats = async (pk: string) => {
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
        data.stats[pk]?.pub_note_count ? data.stats[pk]?.pub_note_count : 0
      );
      // console.log(data.stats[pk]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    setNdk(ndk);
    fetchUser(ndk);
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

  const fetchSentZaps = async (pk: string) => {
    try {
      if (ndk instanceof NDK) {
        setIsZapLoading(true);
        const zaps = Array.from(
          await ndk.fetchEvents({
            kinds: [9735],
            //@ts-ignore
            "@zs": [pk],
            limit: limitSentZaps,
          })
        );
        setSentZaps(zaps);

        const providersPubkyes = zaps.map((zap) => zap.pubkey);
        const providers = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            authors: providersPubkyes,
            limit: limitSentZaps,
          })
        );
        setSentProviders(providers);

        const zapsAmount = zaps.map((zap) => {
          return getZapAmount(zap);
        });
        setAmountSentZaps(zapsAmount);

        const postsIds = zaps.map((zap) => {
          return zap.tags.find((item) => item[0] === "e")
            ? zap.tags.find((item) => item[0] === "e")![1]
            : "";
        });
        const zappedPosts = Array.from(
          await ndk.fetchEvents({
            kinds: [1],
            ids: postsIds,
            limit: limitSentZaps,
          })
        );
        setSentZappedPosts(zappedPosts);

        const sendersComments = zaps.map((zap) => {
          const cleanJSON = zap.tags
            .find((item) => item[0] === "description")![1]
            .replace(/[^\x20-\x7E]/g, "");
          return JSON.parse(cleanJSON).content;
        });
        setSentComments(sendersComments);

        const createdTimes = zaps.map((zap) => {
          return zap.created_at ? zap.created_at : 0;
        });
        setSentCreatedTimes(createdTimes);

        const receiversPubkeys = zaps.map((zap) => {
          return zap.tags.find((item) => item[0] === "p")![1];
        });

        const receiversArr = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            authors: receiversPubkeys,
            limit: limitSentZaps,
          })
        );

        const receivers = receiversArr.map((receiver) => {
          return receiver;
        });
        setReceiverAuthors(receivers);
        setIsZapLoading(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchZaps = async (pk: string) => {
    try {
      if (ndk instanceof NDK) {
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
            ? zap.tags.find((item) => item[0] === "e")![1]
            : "";
        });
        const zappedPosts = Array.from(
          await ndk.fetchEvents({ kinds: [1], ids: postsIds, limit: limitZaps })
        );
        setZappedPosts(zappedPosts);

        const sendersPubkeys = zaps.map((zap) => {
          const cleanJSON = zap.tags
            .find((item) => item[0] === "description")![1]
            .replace(/[^\x20-\x7E]/g, "");
          return JSON.parse(cleanJSON).pubkey;
        });
        // console.log(sendersPubkeys);

        const sendersComments = zaps.map((zap) => {
          const cleanJSON = zap.tags
            .find((item) => item[0] === "description")![1]
            .replace(/[^\x20-\x7E]/g, "");
          return JSON.parse(cleanJSON).content;
        });
        setSendersComments(sendersComments);

        const createdTimes = zaps.map((zap) => {
          return zap.created_at ? zap.created_at : 0;
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
      }
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
    if (tabKey === "zaps-sent") {
      fetchSentZaps(pubkey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitSentZaps]);

  useEffect(() => {
    if (tabKey === "posts" && ndk instanceof NDK) {
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

  const getMoreSentZaps = () => {
    setLimitSentZaps((prevState) => prevState + 10);
  };

  const zapBtn = async () => {
    const d = document.createElement("div");
    d.setAttribute("data-npub", npub ? npub : "");
    d.setAttribute("data-relays", "wss://relay.nostr.band");
    //@ts-ignore
    window.nostrZap.initTarget(d);
    d.click();
    d.remove();
  };

  const sats = stats?.zaps_received?.msats
    ? stats?.zaps_received?.msats / 1000
    : 0;
  const sentSats = stats.zaps_sent?.msats ? stats.zaps_sent?.msats / 1000 : 0;

  const closeModal = () => {
    setIsModal(false);
  };

  const tagsP = store?.contacts?.tags
    ? getAllTags(store.contacts.tags, "p")
    : null;
  const followedPubkeys = Array.isArray(tagsP)
    ? tagsP.map((tag) => tag[1])
    : [];

  const onFollow = async () => {
    if (localStorage.getItem("login")) {
      try {
        if (!followedPubkeys.includes(pubkey)) {
          const msg = {
            content: "",
            kind: 3,
            tags: store?.contacts?.tags
              ? [...store.contacts.tags, ["p", pubkey]]
              : ["p", pubkey],
            created_at: dateToUnix(),
          };

          //@ts-ignore
          const event = await window!.nostr!.signEvent(msg);
          //@ts-ignore
          publish(event);
          dispatch(setContacts(event));
        } else {
          const msg = {
            content: "",
            kind: 3,
            tags: store.contacts?.tags
              ? [...store.contacts.tags.filter((pk) => pk[1] !== pubkey)]
              : [],
            created_at: dateToUnix(),
          };

          //@ts-ignore
          const event = await window.nostr.signEvent(msg);
          //@ts-ignore
          publish(event);
          dispatch(setContacts(event));
        }
      } catch (e) {
        toast.error("Failed to send to Nostr network", { autoClose: 3000 });
        console.log(e);
      }
    } else {
      toast.error("Please, login to follow", { autoClose: 3000 });
    }
  };

  return (
    <div className={cl.profileContainer}>
      <EmbedModal
        isModal={isEmbedModal}
        setIsModal={setIsEmbedModal}
        str={npub ? npub : ""}
      />
      <ReactModal
        bodyOpenClassName={cl.modalBody}
        style={{ overlay: { zIndex: 6 } }}
        ariaHideApp={false}
        className={cl.modal}
        contentLabel="Event Json"
        isOpen={isModal}
        onRequestClose={closeModal}
      >
        <div className={cl.modalHeader}>
          <h2>Event JSON</h2>
          <Button
            variant="link"
            style={{ fontSize: "2.2rem", color: "black" }}
            onClick={closeModal}
          >
            <X />
          </Button>
        </div>
        {modalContent && (
          <textarea
            style={{ width: "100%" }}
            rows={16}
            cols={50}
            value={modalContent}
            readOnly
          />
        )}
        <div className={cl.modalFooter}>
          <Button variant="success" onClick={() => copyUrl(modalContent)}>
            Copy
          </Button>
        </div>
      </ReactModal>
      <Search isLoading={isZapLoading} />
      <h2>Profile</h2>
      {profile ? (
        <>
          <div className={cl.profile}>
            <div className={cl.profileTitle}>
              <div className={cl.profileTitleAvatar}>
                {!imgError && profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile icon"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <img
                    src={`https://media.nostr.band/thumbs/${pubkey.slice(
                      -4
                    )}/${pubkey}-picture-64`}
                    alt="Profile icon"
                    onError={({ currentTarget }) => {
                      currentTarget.srcset = UserIcon;
                    }}
                  />
                )}
              </div>
              <div className={cl.profileInfo}>
                <p className={cl.profileInfoName}>
                  {profile.displayName ? profile.displayName : profile.name}
                </p>
                {npub && (
                  <p>
                    <Key /> {npub.slice(0, 8)}...{npub.slice(-4)}
                  </p>
                )}
                {profile.nip05 && (
                  <div className={cl.profileNip}>
                    <TextCenter />{" "}
                    <MarkdownComponent content={profile.nip05} mode={""} />
                  </div>
                )}
              </div>
            </div>
            <div className={cl.profileAbout}>
              <MarkdownComponent
                content={profile.about ? profile.about : ""}
                mode={""}
              />
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
              {lastEvent?.created_at && (
                <p>Last active: {formatAMPM(lastEvent.created_at * 1000)}</p>
              )}
            </div>
            <div className={`${cl.profileContentControl} ${cl.profileButtons}`}>
              <a target="_blanc" href={`https://nostrapp.link/#${npub}`}>
                <Button variant="outline-secondary">
                  <BoxArrowUpRight /> Open
                </Button>
              </a>
              <Button variant="outline-secondary" onClick={() => zapBtn()}>
                <Lightning /> Zap
              </Button>
              <Button
                variant={`${
                  followedPubkeys.includes(pubkey)
                    ? "outline-success"
                    : "outline-secondary"
                }`}
                onClick={onFollow}
              >
                <PersonPlus />{" "}
                {followedPubkeys.includes(pubkey) ? "Followed" : "Follow"}
              </Button>
              <Button variant="outline-secondary">
                <BookmarkPlus /> List
              </Button>
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="dropdown-basic"
                  style={{ alignItems: "center" }}
                >
                  Menu
                </Dropdown.Toggle>

                <Dropdown.Menu id={cl["menu-id"]}>
                  <Dropdown.Item
                    target="_blanc"
                    href={`https://nostrapp.link/#${npub}?select=true`}
                  >
                    <BoxArrowUpRight /> Open with
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => copyLink(`https://new.nostr.band/${npub}`)}
                  >
                    <Share /> Share
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setIsEmbedModal(true)}>
                    <FileEarmarkPlus /> Embed
                  </Dropdown.Item>
                  <hr />
                  <Dropdown.Item onClick={() => copyUrl(npub ? npub : "")}>
                    Copy npub
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(nprofile)}>
                    Copy nprofile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(pubkey)}>
                    Copy pubkey
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(nnadr)}>
                    Copy contact list naddr
                  </Dropdown.Item>
                  <hr />
                  <Dropdown.Item href={`/?q=following:${npub}&type=posts`}>
                    View home feed
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-1">
                    View edit history
                  </Dropdown.Item>
                  <Dropdown.Item href="#/action-1">View relays</Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setModalContent(profileJson);
                      setIsModal(true);
                    }}
                  >
                    View profile JSON
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setModalContent(contactJson);
                      setIsModal(true);
                    }}
                  >
                    View contacts JSON
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          <div className={cl.userEvents}>
            <Tabs
              activeKey={tabKey}
              onSelect={(k) => setTabKey(k ? k : "")}
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
                          createdDate={event.created_at ? event.created_at : 0}
                          about={event.content}
                          pubkey={event.pubkey}
                          eventId={event.id}
                          picture={profile.image ? profile.image : ""}
                          name={
                            profile.displayName
                              ? profile.displayName
                              : profile.name
                              ? profile.name
                              : ""
                          }
                          ndk={ndk && ndk}
                        />
                      );
                    })
                  : "No posts"}
                {countOfPosts - events.length > 0 && isPostMoreButton ? (
                  <div className={cl.moreBtn}>
                    <Button
                      onClick={() => getMorePosts()}
                      disabled={isZapLoading}
                    >
                      Load more
                    </Button>
                  </div>
                ) : (
                  ""
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
                        .find((item) => item[0] === "description")![1]
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
                          ? author.tags.find((item) => item[0] === "e")![1]
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
                          eventId={zappedPost ? zappedPost?.id : ""}
                          senderPubkey={pk}
                          mode={""}
                        />
                      );
                    })
                  : "No received zaps"}
                {countOfZaps - receivedZaps.length > 0 && isZapMoreButton ? (
                  <div className={cl.moreBtn}>
                    <Button
                      onClick={() => getMoreZaps()}
                      disabled={isZapLoading}
                    >
                      Load more
                    </Button>
                  </div>
                ) : (
                  ""
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
                      const pk = author.tags.find(
                        (item) => item[0] === "p"
                      )![1];

                      const receiver = receiverAuthors.find(
                        (item) => item.pubkey === pk
                      );

                      const receiverContent = receiver
                        ? JSON.parse(receiver.content)
                        : "";

                      const zappedPost = sentZappedPosts.find((item) => {
                        const e = author.tags.find((item) => item[0] === "e")
                          ? author.tags.find((item) => item[0] === "e")![1]
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
                          senderPubkey={pk}
                          eventId={zappedPost ? zappedPost?.id : ""}
                          mode="sent"
                        />
                      );
                    })
                  : "No sent zaps"}
                {countOfSentZaps - sentZaps.length > 0 &&
                isSentZapMoreButton ? (
                  <div className={cl.moreBtn}>
                    <Button
                      onClick={() => getMoreSentZaps()}
                      disabled={isZapLoading}
                    >
                      Load more
                    </Button>
                  </div>
                ) : (
                  ""
                )}
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