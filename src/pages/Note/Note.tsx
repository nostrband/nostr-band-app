import { useEffect, useState } from "react";
import Search from "../../components/Search/Search";
import cl from "./Note.module.css";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { nip19 } from "nostr-tools";
import NDK, { NDKEvent } from "@nostrband/ndk";
import UserIcon from "../../assets/user.png";
import {
  ArrowRepeat,
  Chat,
  HandThumbsUp,
  Lightning,
  BoxArrowUpRight,
  Share,
  FileEarmarkPlus,
  Reply as ReplyIcon,
  LightningFill,
  X,
  ImageFill,
  PlayBtnFill,
  Check,
  TagsFill,
  DatabaseFill,
} from "react-bootstrap-icons";
import { copyLink, copyUrl } from "../../utils/copy-funtions/copyFuntions";
import { Button, Dropdown, Tab, Tabs } from "react-bootstrap";
import MarkdownComponent from "../../components/MarkdownComponent/MarkdownComponent";
import { formatAMPM } from "../../utils/formatDate";
import axios from "axios";
import NoteSkeleton from "./NoteSkeleton/NoteSkeleton";
import PostCard from "../../components/PostCard/PostCard";
import {
  getAllTags,
  getReplyTag,
  getRootTag,
  getTag,
} from "../../utils/getTags";
import { getZapAmount } from "../../utils/zapFunctions";
import ZapTransfer from "../../components/ZapTransfer/ZapTransfer";
import ReactModal from "react-modal";
import EmbedModal from "../../components/EmbedModal/EmbedModal";
import { profileType, statsType } from "../../types/types.js";
import Gallery from "../../components/Gallery/Gallery";
import { formatContent, formatNostrContent } from "../../utils/formatContent";
import { extractNostrStrings } from "../../utils/formatLink";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import AddModal from "../../components/AddModal/AddModal";
import { dateToUnix, useNostr } from "nostr-react";
import { userSlice } from "../../store/reducers/UserSlice";
import { noteHexToNoteId } from "../../utils/decodeFunctions";
import NotFound from "../NotFound/NotFound";
import { compareByTagName } from "../../utils/sortFunctions";
import Thread from "../../components/Thread/Thread";
import { isNaddr, isNevent } from "../../types/guards";
import {
  getKindName,
  openNostrEvent,
  openNostrProfile,
} from "../../utils/helper";
import { Helmet } from "react-helmet";

const Note = () => {
  const store = useAppSelector((store) => store.userReducer);
  const { ndk, ndkAll } = useAppSelector((store) => store.connectionReducer);
  const { publish } = useNostr();
  const [event, setEvent] = useState<NDKEvent | null>(null);
  const [tabKey, setTabKey] = useState("replies");
  const [isLoading, setIsLoading] = useState(false);
  const [pubkey, setPubkey] = useState("");
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [nevent, setNevent] = useState("");
  const [nnadr, setNnadr] = useState("");
  const [author, setAuthor] = useState<profileType>({});
  const [imgError, setImgError] = useState(false);
  const [createdTime, setCreatedTime] = useState(0);
  const [repliesCount, setRepliesCount] = useState<number>(0);
  const [stats, setStats] = useState<statsType>({});
  const [authors, setAuthors] = useState<NDKEvent[]>([]);
  const [replies, setReplies] = useState<NDKEvent[]>([]);
  const [rootPost, setRootPost] = useState<NDKEvent | null>(null);
  const [rootPostAuthor, setRootPostAuthor] = useState<profileType | null>(
    null
  );
  const [threadPost, setThreadPost] = useState<NDKEvent | null>(null);
  const [threadPostAuthor, setThreadPostAuthor] = useState<profileType | null>(
    null
  );
  const [limitReplies, setLimitReplies] = useState(30);
  const [isBottom, setIsBottom] = useState(false);
  const [receivedZaps, setReceivedZaps] = useState<NDKEvent[]>([]);
  const [amountReceivedZaps, setAmountReceivedZaps] = useState<number[]>([]);
  const [sentAuthors, setSentAuthors] = useState<NDKEvent[]>([]);
  const [createdTimes, setCreatedTimes] = useState<number[]>([]);
  const [sendersComments, setSendersComments] = useState<string[]>([]);
  const [zappedPosts, setZappedPosts] = useState<NDKEvent[]>([]);
  const [providers, setProviders] = useState<NDKEvent[]>([]);
  const [limitZaps, setLimitZaps] = useState(10);
  const [countOfZaps, setCountOfZaps] = useState(0);
  const [taggedProfiles, setTaggedProfiles] = useState<(NDKEvent | string)[]>(
    []
  );
  const [content, setContent] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [contentJson, setContentJson] = useState("");
  const [isEmbedModal, setIsEmbedModal] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isVisibleLabelModal, setIsVisibleLabelModal] = useState(false);
  const [rootPostTaggedProfiles, setRootPostTaggedProfiles] = useState<
    (NDKEvent | string)[]
  >([]);
  const [threadPostTaggedProfiles, setThreadPostTaggedProfiles] = useState<
    (NDKEvent | string)[]
  >([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [noteId, setNoteId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBodyContent] = useState("");
  const renderedLabel: string[] = [];

  const { setLabels } = userSlice.actions;
  const dispatch = useAppDispatch();

  const location = useLocation();

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
    fetchNote();
  }, [location.pathname]);

  useEffect(() => {
    if (isBottom) {
      if (tabKey === "replies") {
        if (repliesCount - replies.length > 0) {
          getMoreReplies();
        }
      } else if (tabKey === "zaps") {
        if (countOfZaps - receivedZaps.length > 0 && !isLoading) {
          getMoreZaps();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  useEffect(() => {
    if (searchParams.get("overview") === "zaps-received") {
      setTabKey("zaps");
    } else if (searchParams.get("overview") === "stats") {
      setTabKey("stats");
    } else {
      setTabKey("replies");
    }
  }, [searchParams.get("overview")]);

  // const fetchProfiles = async (pubkeys: string[]) => {
  //   if (ndk instanceof NDK) {
  //     const profiles = Array.from(
  //       await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
  //     );

  //     setTaggedProfiles(profiles.length ? profiles : pubkeys);
  //   }
  // };

  // if (content) {
  //   try {
  //     const links = extractNostrStrings(content);
  //     if (links) {
  //       const pubkeys: string[] = links.map((link: string) => {
  //         if (link.startsWith("npub")) {
  //           return nip19.decode(link).data.toString();
  //         }
  //         return link;
  //       });
  //       console.log(pubkeys);

  //       if (ndk instanceof NDK) {
  //         // fetchProfiles(pubkeys);
  //       }
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  useEffect(() => {
    const newContent = formatNostrContent(
      event?.content ? event?.content : "",
      taggedProfiles
    );
    setContent(newContent);
  }, [event]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMoreReplies = () => {
    setLimitReplies((prevState) => prevState + 10);
  };

  let { router } = useParams();
  if (router?.startsWith("nostr:")) router = router.substring(6);
  const noteHex = router;
  const noteIdCheck = noteHex ? noteHexToNoteId(noteHex) : "";

  const fetchNote = async () => {
    try {
      setRootPost(null);
      setRootPostAuthor(null);
      setThreadPostAuthor(null);
      setThreadPost(null);
      setIsLoading(true);
      const noteId = noteHex ? noteHexToNoteId(noteHex) : "";

      const noteFilter = isNaddr(noteId)
        ? {
            authors: [noteId?.pubkey],
            kinds: [noteId?.kind],
            "#d": [noteId?.identifier],
          }
        : isNevent(noteId)
        ? { ids: [noteId!.id] }
        : { ids: [noteId] };
      //@ts-ignore
      const note = await ndk.fetchEvent(noteFilter);
      setNoteId(note?.id ?? "");
      const links = extractNostrStrings(note!.content);
      const pubkeys: string[] = links.map((link: string) => {
        if (link.startsWith("npub")) {
          return nip19.decode(link).data.toString();
        } else if (link.startsWith("nprofile")) {
          //@ts-ignore
          return nip19.decode(link).data.pubkey.toString();
        }
        return link;
      });
      const taggedUsers = pubkeys.length
        ? Array.from(await ndk.fetchEvents({ kinds: [0], authors: pubkeys }))
        : [];

      const linksWithoutNpub = links.filter(
        (link) => !link.startsWith("npub") && !link.startsWith("nprofile")
      );

      const allTaggedEvents = [...linksWithoutNpub, ...taggedUsers];

      setTaggedProfiles(allTaggedEvents);

      const tagsE = note?.tags ? getAllTags(note.tags, "e") : [];

      const rootId = getRootTag(tagsE);

      if (rootId) {
        //@ts-ignore
        const rootPost = await ndk.fetchEvent({ ids: [rootId] });
        const postLinks = rootPost?.content
          ? extractNostrStrings(rootPost?.content)
          : [];
        const notNpubLinks = postLinks.filter((r) => !r.startsWith("npub"));
        const npubs = postLinks.filter((r) => r.startsWith("npub"));
        const pubkeys = npubs.map((npub) => nip19.decode(npub).data);

        const postsTaggedUsers = Array.from(
          //@ts-ignore
          await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
        );
        const allPostsTagged = [...notNpubLinks, ...postsTaggedUsers];
        setRootPostTaggedProfiles(allPostsTagged);

        setRootPost(rootPost);

        const rootPostAuthor = rootPost
          ? //@ts-ignore
            await ndk.fetchEvent({
              kinds: [0],
              authors: [rootPost.pubkey],
            })
          : null;

        const authorContent = rootPostAuthor
          ? JSON.parse(rootPostAuthor.content)
          : {};
        setRootPostAuthor(authorContent);
      }

      const replyId = getReplyTag(tagsE);

      if (replyId) {
        //@ts-ignore
        const threadPost = await ndk.fetchEvent({ ids: [replyId] });

        const threadPostAuthor = threadPost
          ? //@ts-ignore
            await ndk.fetchEvent({
              kinds: [0],
              authors: [threadPost.pubkey],
            })
          : null;
        const authorContent = threadPostAuthor
          ? JSON.parse(threadPostAuthor.content)
          : {};

        setThreadPost(threadPost);
        const postLinks = threadPostAuthor?.content
          ? extractNostrStrings(threadPostAuthor?.content)
          : [];
        const notNpubLinks = postLinks.filter((r) => !r.startsWith("npub"));
        const npubs = postLinks.filter((r) => r.startsWith("npub"));
        const pubkeys = npubs.map((npub) => nip19.decode(npub).data);

        const postsTaggedUsers = Array.from(
          //@ts-ignore
          await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
        );
        const allPostsTagged = [...notNpubLinks, ...postsTaggedUsers];
        setThreadPostTaggedProfiles(allPostsTagged);

        setThreadPostAuthor(authorContent);
      }

      const title = getTag(note?.tags ?? [], ["title", "name"]);
      const body = getTag(note?.tags ?? [], [
        "summary",
        "description",
        "alt",
      ]).slice(0, 300);
      setTitle(title);
      setBodyContent(body);

      setEvent(note);
      setContent(note ? note.content : "");
      const author = note
        ? //@ts-ignore
          await ndk.fetchEvent({
            kinds: [0],
            authors: [note.pubkey],
          })
        : null;

      setAuthor(author?.content ? JSON.parse(author.content) : {});
      setPubkey(author?.pubkey ? author.pubkey : "");
      setCreatedTime(note?.created_at ? note.created_at : 0);
      const npub = note?.pubkey ? nip19.npubEncode(note.pubkey) : "";
      const nprofile = note?.pubkey
        ? nip19.nprofileEncode({ pubkey: note.pubkey })
        : "";
      const nevent = note?.id ? nip19.neventEncode({ id: note.id }) : "";
      setContentJson(
        JSON.stringify(
          {
            pubkey: author?.pubkey ? author.pubkey : "",
            content: note ? note.content : {},
            id: note?.id ? note.id : "",
            created_at: note?.created_at ? note.created_at : 0,
            kind: "1",
            tags: note?.tags ? note.tags : [],
          },
          null,
          2
        )
      );
      setNpubKey(npub);
      setNprofile(nprofile);
      setNevent(nevent);
      setNnadr(
        nip19.naddrEncode({
          kind: 3,
          pubkey: note?.pubkey ? note.pubkey : "",
          identifier: "",
          relays: ["wss://relay.nostr.band"],
        })
      );
      fetchStats(note?.id ?? "");
      fetchCount(note?.id ?? "");
      // console.log(JSON.parse(author.content));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getMoreZaps = () => {
    setLimitZaps((prevState) => prevState + 10);
  };

  const fetchCount = async (noteId: string) => {
    try {
      const repliesCount = await ndk.fetchCount({ kinds: [1], "#e": [noteId] });
      setRepliesCount(repliesCount?.count ?? 0);
      const zapsCount = await ndk.fetchCount({ kinds: [9735], "#e": [noteId] });
      setCountOfZaps(zapsCount?.count ?? 0);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchStats = async (noteId: string) => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/event/${noteId}`
      );
      setStats(data.stats[noteId]);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchZaps = async (eventId: string) => {
    try {
      if (ndk instanceof NDK) {
        setIsLoading(true);
        const zaps = Array.from(
          await ndkAll.fetchEvents({
            kinds: [9735],
            "#e": [eventId],
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

        const sendersComments: string[] = zaps.map((zap) => {
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

        const senders = sendersArr.map((sender) => {
          return sender;
        });
        setSentAuthors(senders);
        setIsLoading(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

  useEffect(() => {
    if (tabKey === "zaps" && noteId) {
      fetchZaps(noteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, limitReplies, limitZaps, location.pathname, noteId]);

  const sats = stats?.zaps?.msats ? stats?.zaps?.msats / 1000 : null;

  const closeModal = () => {
    setIsModal(false);
  };

  const contents = formatContent(event?.content ? event.content : "");

  const isSameType = () =>
    contents.every((obj) => obj.type === contents[0].type);

  const zapBtn = async () => {
    const d = document.createElement("div");
    d.setAttribute("data-npub", npubKey);
    d.setAttribute("data-note-id", noteId);
    d.setAttribute("data-relays", "wss://relay.nostr.band");
    //@ts-ignore
    window!.nostrZap!.initTarget(d)!;
    d.click();
    d.remove();
  };

  const handleLabel = async (labelId: string) => {
    const label = store.labels.find((label) => label.id === labelId);
    const labelNotes = label && getAllTags(label.tags, "e").map((e) => e[1]);
    try {
      if (labelNotes?.includes(noteId)) {
        const newLabel = label?.tags.filter((label) => label[1] !== noteId);
        const msg = {
          kind: 1985,
          tags: newLabel,
          content: "",
          created_at: dateToUnix(),
          pubkey: localStorage.getItem("login")!,
        };
        //@ts-ignore
        const res = await window!.nostr!.signEvent(msg);
        //@ts-ignore
        publish(res);
        const updatedLabels = store.labels.map((l) => {
          if (l.id !== labelId) {
            return l;
          }
          return res;
        });
        dispatch(setLabels(updatedLabels));
      } else {
        const newLabel = [...label?.tags!, ["e", noteId]];
        const msg = {
          kind: 1985,
          tags: newLabel,
          content: "",
          created_at: dateToUnix(),
          pubkey: localStorage.getItem("login")!,
        };
        //@ts-ignore
        const res = await window!.nostr!.signEvent(msg);
        //@ts-ignore
        publish(res);
        const updatedLabel = store.labels.map((l) => {
          if (l.id !== labelId) {
            return l;
          }
          return res;
        });
        dispatch(setLabels(updatedLabel));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const changeTabKey = (k: string | null) => {
    setTabKey(k ? k : "");
    if (k === "zaps") {
      setSearchParams("overview=zaps-received");
    } else if (k === "stats") {
      setSearchParams("overview=stats");
    } else {
      searchParams.delete("overview");
      setSearchParams(searchParams);
    }
  };

  return noteIdCheck ? (
    <div className={cl.noteContainer}>
      <Helmet>
        <title>{`${
          author?.name || author?.display_name
        } ${event?.content.substring(0, 50)} ${event?.id}`}</title>
        <meta
          name="robots"
          content="index, follow, noimageindex, max-snippet:-1, max-image-preview:none, max-video-preview:-1, nositelinkssearchbox"
        />
      </Helmet>
      <AddModal
        isModal={isVisibleLabelModal}
        setIsModal={setIsVisibleLabelModal}
        type={"label"}
        selectedPostId={noteId}
      />
      <EmbedModal
        isModal={isEmbedModal}
        setIsModal={setIsEmbedModal}
        str={noteHex ? noteHex : ""}
      />
      <ReactModal
        bodyOpenClassName={cl.modalBody}
        ariaHideApp={false}
        className={cl.modal}
        style={{ overlay: { zIndex: 6, background: "rgba(0,0,0,0.4)" } }}
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
            <X color="var(--body-color)" />
          </Button>
        </div>
        {modalContent && (
          <textarea
            className={cl.modalTextArea}
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
      <Search isLoading={isLoading} />
      {rootPost && rootPostAuthor ? (
        <PostCard
          taggedProfiles={rootPostTaggedProfiles}
          name={
            rootPostAuthor.display_name
              ? rootPostAuthor.display_name
              : rootPostAuthor.name
              ? rootPostAuthor.name
              : ""
          }
          picture={rootPostAuthor.picture ? rootPostAuthor.picture : ""}
          eventId={rootPost.id}
          about={rootPost.content}
          pubkey={rootPost.pubkey}
          createdDate={rootPost.created_at ? rootPost.created_at : 0}
          thread={""}
        />
      ) : (
        ""
      )}
      {threadPost && threadPostAuthor && rootPostAuthor ? (
        <PostCard
          taggedProfiles={threadPostTaggedProfiles}
          name={
            threadPostAuthor.display_name
              ? threadPostAuthor.display_name
              : threadPostAuthor.name
              ? threadPostAuthor.name
              : ""
          }
          picture={threadPostAuthor.picture ? threadPostAuthor.picture : ""}
          eventId={threadPost.id}
          about={threadPost.content}
          pubkey={threadPost.pubkey}
          createdDate={threadPost.created_at ? threadPost.created_at : 0}
          thread={
            rootPostAuthor.display_name
              ? rootPostAuthor.display_name
              : rootPostAuthor.name
              ? rootPostAuthor.name
              : ""
          }
        />
      ) : (
        ""
      )}
      {event ? (
        <>
          <div className={cl.note}>
            {rootPost && (
              <p className={cl.replyTo}>
                Replying to{" "}
                {threadPostAuthor
                  ? threadPostAuthor.display_name
                    ? threadPostAuthor.display_name
                    : threadPostAuthor.name
                  : rootPostAuthor?.display_name
                  ? rootPostAuthor?.display_name
                  : rootPostAuthor?.name}
              </p>
            )}
            <div className={cl.noteAuthor}>
              <Link to={`/${npubKey}`}>
                <div className={cl.noteAuthorAvatar}>
                  {!imgError && author ? (
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
                      src={`https://media.nostr.band/thumbs/${pubkey.slice(
                        -4
                      )}/${pubkey}-picture-64`}
                      alt="avatar"
                      onError={({ currentTarget }) => {
                        currentTarget.srcset = UserIcon;
                      }}
                    />
                  )}
                </div>
              </Link>
              {author && (
                <Link className={cl.noteNameLink} to={`/${npubKey}`}>
                  {author.display_name ? author.display_name : author.name}
                </Link>
              )}
              <Dropdown id="profile-dropdown" className="profile-dropdown">
                <Dropdown.Toggle
                  size="sm"
                  id="dropdown-basic"
                ></Dropdown.Toggle>
                <Dropdown.Menu
                  variant={store.theme === "dark" ? "dark" : "light"}
                >
                  <Dropdown.Item
                    onClick={(e) => openNostrProfile(e, npubKey)}
                    // href={`https://nostrapp.link/#${npubKey}`}
                  >
                    Open
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(npubKey)}>
                    Copy npub
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(nprofile)}>
                    Copy nprofile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(pubkey)}>
                    Copy pubkey
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            {event.kind !== 1 && title && (
              <div>
                <b>{title.slice(0, 100)}</b>
              </div>
            )}
            <div className={cl.noteAbout}>
              <MarkdownComponent
                content={
                  event.kind === 1
                    ? content
                    : body
                    ? body.slice(0, 300)
                    : content
                }
                mode="post"
              />
            </div>
            <div className={cl.btnLink}>
              {contents && contents.length ? (
                isBannerVisible ? (
                  <Button
                    onClick={() => setIsBannerVisible(false)}
                    variant={store.theme === "dark" ? "dark" : "light"}
                  >
                    Hide
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsBannerVisible(true)}
                    variant={store.theme === "dark" ? "dark" : "light"}
                  >
                    {isSameType() ? (
                      contents[0].type === "PictureType" ? (
                        <>
                          Show <ImageFill />
                        </>
                      ) : (
                        <>
                          Show <PlayBtnFill />
                        </>
                      )
                    ) : (
                      <>
                        Show <ImageFill /> <PlayBtnFill />
                      </>
                    )}
                  </Button>
                )
              ) : (
                ""
              )}
            </div>
            <Gallery contents={contents} isBannerVisible={isBannerVisible} />
            <div className={cl.noteCreated}>
              {event.kind &&
                event.kind !== 1 &&
                `Kind ${getKindName(event.kind)}, `}
              <span>{formatAMPM(createdTime * 1000)}</span>
            </div>
            <div className={cl.postStats}>
              {sats && (
                <div className={cl.postState}>
                  <Lightning />
                  <span>
                    {Number(sats) > 1000000
                      ? `${Math.round(sats / 1000000)}M`
                      : Number(sats) >= 1000
                      ? `${Math.round(sats / 1000)}K`
                      : sats}
                  </span>
                </div>
              )}
              {stats.reply_count && (
                <div className={cl.postState}>
                  <Chat />
                  <span>{stats.reply_count}</span>
                </div>
              )}
              {stats.repost_count && (
                <div className={cl.postState}>
                  <ArrowRepeat />
                  <span>
                    {stats.repost_count > 1000
                      ? `${Math.round(stats.repost_count / 1000)}K`
                      : stats.repost_count}
                  </span>
                </div>
              )}
              {stats.reaction_count && (
                <div className={cl.postState}>
                  <HandThumbsUp />
                  <span>
                    {stats.reaction_count > 1000
                      ? `${Math.round(stats.reaction_count / 1000)}K`
                      : stats.reaction_count}
                  </span>
                </div>
              )}
            </div>
            <div className={`${cl.profileContentControl} ${cl.profileButtons}`}>
              <a onClick={(e) => openNostrEvent(e, noteHex ?? "", false)}>
                <Button variant="outline-secondary">
                  <BoxArrowUpRight /> Open
                </Button>
              </a>
              <Link
                target="_blanc"
                to={`https://zapper.nostrapps.org/zap?id=${noteHex}`}
              >
                <Button variant="outline-secondary">
                  <Lightning /> Zap
                </Button>
              </Link>
              <Dropdown>
                <Dropdown.Toggle
                  variant={`${
                    store.labels.some((label) => {
                      const idsOfLabel = getAllTags(label.tags, "e").map(
                        (e) => e[1]
                      );
                      if (idsOfLabel.includes(noteId)) {
                        return true;
                      }
                    })
                      ? "outline-success"
                      : "outline-secondary"
                  }`}
                  style={{ alignItems: "center" }}
                >
                  <TagsFill /> Label
                </Dropdown.Toggle>

                <Dropdown.Menu
                  variant={store.theme === "dark" ? "dark" : "light"}
                >
                  {store.labels &&
                    store.isAuth &&
                    store.labels
                      .slice()
                      .sort(compareByTagName)
                      .map((label) => {
                        const listLabel = getAllTags(label.tags, "l").flat();
                        if (renderedLabel.includes(listLabel[1])) {
                          return null;
                        }
                        renderedLabel.push(listLabel[1]);
                        const idsOfLabel = getAllTags(label.tags, "e").map(
                          (e) => e[1]
                        );
                        return (
                          <Dropdown.Item
                            key={label.id}
                            onClick={() => handleLabel(label.id)}
                          >
                            {idsOfLabel.includes(noteId) && <Check />}{" "}
                            {listLabel[1]}
                          </Dropdown.Item>
                        );
                      })}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => setIsVisibleLabelModal(true)}>
                    New Label
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle
                  variant="secondary"
                  id="dropdown-basic"
                  style={{ alignItems: "center" }}
                >
                  Menu
                </Dropdown.Toggle>

                <Dropdown.Menu
                  variant={store.theme === "dark" ? "dark" : "light"}
                  id={cl["menu-id"]}
                >
                  <Dropdown.Item
                    onClick={(e) => openNostrEvent(e, noteHex ?? "", true)}
                  >
                    <BoxArrowUpRight /> Open with
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => copyLink(`https://nostrapp.link/${noteHex}`)}
                  >
                    <Share /> Share
                  </Dropdown.Item>
                  {event.kind === 1 && (
                    <Dropdown.Item onClick={() => setIsEmbedModal(true)}>
                      <FileEarmarkPlus /> Embed
                    </Dropdown.Item>
                  )}
                  <hr />
                  <Dropdown.Item onClick={() => copyUrl(noteHex ?? "")}>
                    Copy note id
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(noteId)}>
                    Copy hex id
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyUrl(nevent)}>
                    Copy nevent
                  </Dropdown.Item>
                  <hr />
                  <Dropdown.Item href="#/action-1">View relays</Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      setModalContent(contentJson);
                      setIsModal(true);
                    }}
                  >
                    View JSON
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          <div className={cl.userEvents}>
            <Tabs
              activeKey={tabKey}
              onSelect={(k) => changeTabKey(k)}
              defaultActiveKey="profile"
              id="justify-tab-example"
              className={`mb-3 ${cl.tab}`}
              variant="pills"
              justify
            >
              <Tab
                eventKey="replies"
                title={
                  <span className="d-flex align-items-center">
                    <ReplyIcon style={{ marginRight: "5px" }} />
                    replies&nbsp;
                    {repliesCount}
                  </span>
                }
              >
                {noteId && repliesCount ? (
                  <div className={cl.repliesWrapper}>
                    <Thread anchor={noteHex} />
                  </div>
                ) : (
                  "No replies"
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
              >
                {receivedZaps.length && createdTimes.length ? (
                  receivedZaps.map((rzap, index) => {
                    const cleanJSON = rzap.tags
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
                      const e = rzap.tags.find((item) => item[0] === "e")
                        ? rzap.tags.find((item) => item[0] === "e")![1]
                        : "";
                      return item.id === e;
                    });

                    const pr = providers.find(
                      (provider) => provider.pubkey === rzap.pubkey
                    );
                    const provider = pr ? JSON.parse(pr.content) : "";
                    return (
                      <ZapTransfer
                        key={index}
                        created={createdTimes[index]}
                        sender={senderContent}
                        amount={amountReceivedZaps[index]}
                        receiver={author}
                        comment={sendersComments[index]}
                        zappedPost={zappedPost ? zappedPost.content : ""}
                        provider={provider}
                        eventId={zappedPost ? zappedPost?.id : ""}
                        senderPubkey={pk}
                        mode={""}
                      />
                    );
                  })
                ) : (
                  <span style={{ color: "var(--body-color)" }}>
                    No received zaps
                  </span>
                )}
              </Tab>
              <Tab
                eventKey="stats"
                title={
                  <div className="d-flex align-items-center">
                    <DatabaseFill />
                    &nbsp;stats
                  </div>
                }
              >
                <div className={cl.statsBar}>
                  <h4>Overview</h4>
                  <p>
                    Need these numbers in your client? Try our{" "}
                    <a href="https://api.nostr.band/" target="_blanc">
                      API
                    </a>
                    .
                  </p>
                  <h5>Published by profile:</h5>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Replies: <strong>{stats.reply_count ?? 0}</strong>
                    </p>
                    <span>
                      Number of replies to this post.{" "}
                      <Link to={`/${noteHex}`}>View</Link>
                    </span>
                  </div>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Replying profiles:{" "}
                      <strong>{stats.reply_pubkey_count ?? 0}</strong>
                    </p>
                    <span>Number of profiles that reply to this post.</span>
                  </div>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Reposts: <strong>{stats.repost_count ?? 0}</strong>
                    </p>
                    <span>Number of reposts of this post.</span>
                  </div>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Reposting profiles:{" "}
                      <strong>{stats.repost_pubkey_count ?? 0}</strong>
                    </p>
                    <span>Number of profiles that reposted this post.</span>
                  </div>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Likes: <strong>{stats.reaction_count ?? 0}</strong>
                    </p>
                    <span>Number of likes of this post.</span>
                  </div>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Liking profiles:{" "}
                      <strong>{stats.pub_reaction_count ?? 0}</strong>
                    </p>
                    <span>Number of profiles that like this post.</span>
                  </div>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Reports: <strong>{stats.report_count ?? 0}</strong>
                    </p>
                    <span>Number of reports of this post.</span>
                  </div>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Reporting profiles:{" "}
                      <strong>{stats.report_pubkey_count ?? 0}</strong>
                    </p>
                    <span>Number of profiles that report this post.</span>
                  </div>
                  <h5>Zaps received:</h5>
                  <div className={cl.statsBarWrapper}>
                    <p>
                      Number of zaps: <strong>{stats.zaps?.count ?? 0}</strong>
                    </p>
                    <span>
                      Number of zaps received by this post.{" "}
                      <Link to={`/${noteHex}?overview=zaps-received`}>
                        View
                      </Link>
                    </span>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </>
      ) : (
        <NoteSkeleton />
      )}
    </div>
  ) : (
    <NotFound />
  );
};

export default Note;
