import { useEffect, useState } from "react";
import Search from "../../components/Search/Search";
import cl from "./Note.module.css";
import { Link, useLocation, useParams } from "react-router-dom";
import { nip19 } from "nostr-tools";
import NDK, { NDKEvent, NDKTag } from "@nostrband/ndk";
import UserIcon from "../../assets/user.png";
import {
  ArrowRepeat,
  Chat,
  HandThumbsUp,
  Lightning,
  BoxArrowUpRight,
  Share,
  FileEarmarkPlus,
  Tags,
  Reply as ReplyIcon,
  LightningFill,
  X,
  ImageFill,
  PlayBtnFill,
  Check,
  TagsFill,
} from "react-bootstrap-icons";
import { copyLink, copyUrl } from "../../utils/copy-funtions/copyFuntions";
import { Button, Dropdown, Tab, Tabs } from "react-bootstrap";
import MarkdownComponent from "../../components/MarkdownComponent/MarkdownComponent";
import { formatAMPM } from "../../utils/formatDate";
import axios from "axios";
import NoteSkeleton from "./NoteSkeleton/NoteSkeleton";
import Reply from "../../components/Reply/Reply";
import PostCard from "../../components/PostCard/PostCard";
import { getAllTags, getReplyTag, getRootTag } from "../../utils/getTags";
import { getZapAmount } from "../../utils/zapFunctions";
import ZapTransfer from "../../components/ZapTransfer/ZapTransfer";
import ReactModal from "react-modal";
import EmbedModal from "../../components/EmbedModal/EmbedModal";
import { profileType, statsType } from "../../types/types.js";
import Gallery from "../../components/Gallery/Gallery";
import { formatContent } from "../../utils/formatContent";
import { extractNostrStrings, replaceNostrLinks } from "../../utils/formatLink";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import AddModal from "../../components/AddModal/AddModal";
import { dateToUnix, useNostr } from "nostr-react";
import { userSlice } from "../../store/reducers/UserSlice";
import { noteHexToNoteId } from "../../utils/decodeFunctions";
import NotFound from "../NotFound/NotFound";

const Note = () => {
  const store = useAppSelector((store) => store.userReducer);
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const { publish } = useNostr();
  const [event, setEvent] = useState<NDKEvent | null>(null);
  const [tabKey, setTabKey] = useState("replies");
  const [isLoading, setIsLoading] = useState(false);
  const [pubkey, setPubkey] = useState("");
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [nnadr, setNnadr] = useState("");
  const [author, setAuthor] = useState<profileType>({});
  const [imgError, setImgError] = useState(false);
  const [createdTime, setCreatedTime] = useState(0);
  const [repliesCount, setRepliesCount] = useState(0);
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
  const [repliesTagged, setRepliesTagged] = useState<(NDKEvent | string)[]>([]);
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
    if (taggedProfiles) {
      taggedProfiles.map((profile) => {
        if (profile instanceof NDKEvent) {
          const profileContent = JSON.parse(profile.content);
          const npub = nip19.npubEncode(profile.pubkey);
          setContent(
            replaceNostrLinks(
              content,
              profileContent?.display_name
                ? `@${profileContent?.display_name}`
                : `@${profileContent?.name}`,
              `nostr:${npub}`
            )
          );
        } else if (profile.toString().startsWith("note")) {
          setContent(
            replaceNostrLinks(
              content,
              `${profile.toString().slice(0, 10)}...${profile
                .toString()
                .slice(-4)}`,
              `nostr:${profile}`
            )
          );
        } else {
          setContent(
            replaceNostrLinks(
              content,
              `${profile.toString().slice(0, 12)}...${profile
                .toString()
                .slice(-4)}`,
              `nostr:${profile}`
            )
          );
        }
      });
    }
  }, [taggedProfiles]);

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

  const { router } = useParams();
  const note = router;
  const noteId = note ? noteHexToNoteId(note) : "";

  const fetchNote = async () => {
    try {
      setRootPost(null);
      setRootPostAuthor(null);
      setThreadPostAuthor(null);
      setThreadPost(null);
      setIsLoading(true);
      //@ts-ignore
      const note = await ndk.fetchEvent({ ids: [noteId] });
      const links = extractNostrStrings(note!.content);
      const pubkeys: string[] = links.map((link: string) => {
        if (link.startsWith("npub")) {
          return nip19.decode(link).data.toString();
        }
        return link;
      });
      const taggedUsers = pubkeys.length
        ? Array.from(await ndk.fetchEvents({ kinds: [0], authors: pubkeys }))
        : [];
      const linksWithoutNpub = links.filter((link) => !link.startsWith("npub"));

      const allTaggedEvents = [...linksWithoutNpub, ...taggedUsers];

      setTaggedProfiles(allTaggedEvents);

      const tagsE = note?.tags ? getAllTags(note.tags, "e") : [];

      const rootId = getRootTag(tagsE);

      if (rootId) {
        //@ts-ignore
        const rootPost = await ndk.fetchEvent({ ids: [rootId] });
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

        setThreadPostAuthor(authorContent);
      }

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
      setNnadr(
        nip19.naddrEncode({
          kind: 3,
          pubkey: note?.pubkey ? note.pubkey : "",
          identifier: "",
          relays: ["wss://relay.nostr.band"],
        })
      );
      fetchStats();
      // console.log(JSON.parse(author.content));
      // fetchReplies(ndk);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getMoreZaps = () => {
    setLimitZaps((prevState) => prevState + 10);
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats/event/${noteId}`
      );
      setStats(data.stats[noteId]);
      setRepliesCount(
        data.stats[noteId]?.reply_count ? data.stats[noteId]?.reply_count : 0
      );
      setCountOfZaps(
        data.stats[noteId]?.zaps?.count ? data.stats[noteId]?.zaps?.count : 0
      );
    } catch (e) {
      console.log(e);
    }
  };

  const fetchReplies = async (ndk?: NDK | {}) => {
    if (ndk instanceof NDK) {
      try {
        setIsLoading(true);
        const repliesArr = Array.from(
          await ndk.fetchEvents({
            kinds: [1],
            "#e": [noteId],
            limit: limitReplies,
          })
        );

        const authorPks = repliesArr.map((author) => author.pubkey);
        const replies: NDKEvent[] = repliesArr.map((reply) => {
          const tagsE = getAllTags(reply.tags, "e");

          const eTag = tagsE.find((r: NDKTag) => r[0] === "e");
          if (eTag && !eTag.includes("mention") && tagsE.length === 1) {
            return reply;
          } else if (eTag && eTag.includes("root")) {
            return reply;
          } else if (eTag && eTag.length <= 3) {
            return reply;
          }
          return reply;
        });

        const replieLinks = replies
          .map((event) => extractNostrStrings(event.content))
          .flat();
        const notNpubLinks = replieLinks.filter((r) => !r.startsWith("npub"));
        const npubs = replieLinks.filter((r) => r.startsWith("npub"));
        const pubkeys = npubs.map((npub) => nip19.decode(npub).data);

        const repliesTaggedUsers = Array.from(
          //@ts-ignore
          await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
        );
        const allPostsTagged = [...notNpubLinks, ...repliesTaggedUsers];
        setRepliesTagged(allPostsTagged);

        setReplies(replies);

        const authors = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            authors: authorPks,
            limit: limitReplies,
          })
        );

        setAuthors(authors);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const fetchZaps = async (eventId: string) => {
    try {
      if (ndk instanceof NDK) {
        setIsLoading(true);
        const zaps = Array.from(
          await ndk.fetchEvents({
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
    if (tabKey === "replies") {
      fetchReplies(ndk);
    } else if (tabKey === "zaps") {
      fetchZaps(noteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, limitReplies, limitZaps, location.pathname]);

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

  return noteId ? (
    <div className={cl.noteContainer}>
      <AddModal
        isModal={isVisibleLabelModal}
        setIsModal={setIsVisibleLabelModal}
        type={"label"}
        selectedPostId={noteId}
      />
      <EmbedModal
        isModal={isEmbedModal}
        setIsModal={setIsEmbedModal}
        str={note ? note : ""}
      />
      <ReactModal
        bodyOpenClassName={cl.modalBody}
        ariaHideApp={false}
        className={cl.modal}
        style={{ overlay: { zIndex: 6 } }}
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
      <Search isLoading={isLoading} />
      {rootPost && rootPostAuthor ? (
        <PostCard
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
          ndk={ndk}
          thread={""}
        />
      ) : (
        ""
      )}
      {threadPost && threadPostAuthor && rootPostAuthor ? (
        <PostCard
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
                  <Dropdown.Item onClick={() => copyUrl(pubkey)}>
                    Copy pubkey
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className={cl.noteAbout}>
              <MarkdownComponent content={content} mode="post" />
            </div>
            <div className={cl.btnLink}>
              {contents && contents.length ? (
                isBannerVisible ? (
                  <Button
                    onClick={() => setIsBannerVisible(false)}
                    variant="light"
                  >
                    Hide
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsBannerVisible(true)}
                    variant="light"
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
              <a target="_blanc" href={`https://nostrapp.link/#${note}`}>
                <Button variant="outline-secondary">
                  <BoxArrowUpRight /> Open
                </Button>
              </a>
              <Button variant="outline-secondary" onClick={() => zapBtn()}>
                <Lightning /> Zap
              </Button>
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

                <Dropdown.Menu>
                  {store.labels &&
                    store.isAuth &&
                    store.labels.map((label) => {
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

                <Dropdown.Menu id={cl["menu-id"]}>
                  <Dropdown.Item
                    target="_blanc"
                    href={`https://nostrapp.link/#${note}?select=true`}
                  >
                    <BoxArrowUpRight /> Open with
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => copyLink(`https://new.nostr.band/${note}`)}
                  >
                    <Share /> Share
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setIsEmbedModal(true)}>
                    <FileEarmarkPlus /> Embed
                  </Dropdown.Item>
                  <hr />
                  <Dropdown.Item onClick={() => copyUrl(npubKey)}>
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
              onSelect={(k) => setTabKey(k ? k : "")}
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
                {replies.length
                  ? replies.map((reply, index) => {
                      const author = authors.find(
                        (author) => author.pubkey === reply.pubkey
                      );

                      return reply ? (
                        <Reply
                          taggedProfiles={repliesTagged}
                          key={index}
                          author={author}
                          content={reply?.content ? reply.content : ""}
                          eventId={reply?.id ? reply.id : ""}
                          createdDateAt={
                            reply.created_at ? reply.created_at : 0
                          }
                        />
                      ) : (
                        ""
                      );
                    })
                  : ""}
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
                {receivedZaps.length && createdTimes.length
                  ? receivedZaps.map((rzap, index) => {
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
                  : "No received zaps"}
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
