import React, { useEffect, useState } from "react";
import Search from "../../components/Search/Search";
import cl from "./Note.module.css";
import { Link, useLocation, useParams } from "react-router-dom";
import { nip19 } from "nostr-tools";
import NDK from "@nostrband/ndk";
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
} from "react-bootstrap-icons";
import { copyLink, copyUrl } from "../../utils/copy-funtions/copyFuntions";
import { Button, Dropdown, Tab, Tabs } from "react-bootstrap";
import MarkdownComponent from "../../components/MarkdownComponent/MarkdownComponent";
import { formatAMPM } from "../../utils/formatDate";
import axios from "axios";
import NoteSkeleton from "./NoteSkeleton/NoteSkeleton";
import Reply from "../../components/Reply/Reply";
import PostCard from "../../components/PostCard/PostCard";
import { getAllTags } from "../../utils/getTags";
import { getZapAmount } from "../../utils/zapFunctions";
import ZapTransfer from "../../components/ZapTransfer/ZapTransfer";
import ReactModal from "react-modal";
import EmbedModal from "../../components/EmbedModal/EmbedModal";

const Note = () => {
  const [event, setEvent] = useState([]);
  const [tabKey, setTabKey] = useState("replies");
  const [isLoading, setIsLoading] = useState(false);
  const [ndk, setNdk] = useState({});
  const [pubkey, setPubkey] = useState("");
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [nnadr, setNnadr] = useState("");
  const [author, setAuthor] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [createdTime, setCreatedTime] = useState("");
  const [repliesCount, setRepliesCount] = useState("");
  const [stats, setStats] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [replies, setReplies] = useState([]);
  const [rootPost, setRootPost] = useState(null);
  const [rootPostAuthor, setRootPostAuthor] = useState(null);
  const [threadPost, setThreadPost] = useState(null);
  const [threadPostAuthor, setThreadPostAuthor] = useState(null);
  const [limitReplies, setLimitReplies] = useState(100);
  const [isBottom, setIsBottom] = useState(false);
  const [receivedZaps, setReceivedZaps] = useState([]);
  const [amountReceivedZaps, setAmountReceivedZaps] = useState([]);
  const [sentAuthors, setSentAuthors] = useState([]);
  const [createdTimes, setCreatedTimes] = useState([]);
  const [sendersComments, setSendersComments] = useState([]);
  const [zappedPosts, setZappedPosts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [limitZaps, setLimitZaps] = useState(10);
  const [countOfZaps, setCountOfZaps] = useState("");
  const [taggedProfiles, setTaggedProfiles] = useState([]);
  const [content, setContent] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [contentJson, setContentJson] = useState("");
  const [isEmbedModal, setIsEmbedModal] = useState(false);

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
    setTabKey("replies");
  }, [location.pathname]);

  useEffect(() => {
    if (tabKey === "replies") {
      fetchReplies(ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitReplies]);

  useEffect(() => {
    if (isBottom) {
      if (tabKey === "replies") {
        if (repliesCount - replies.length > 0) {
          getMoreReplies();
        }
      } else if (tabKey === "zaps") {
        if (countOfZaps - receivedZaps.length > 0) {
          getMoreZaps(pubkey);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  function extractNostrStrings(inputString) {
    const nostrPattern = /nostr:[a-zA-Z0-9]+/;
    const matches = inputString.match(nostrPattern);

    if (matches) {
      return matches.map((match) => match.slice("nostr:".length));
    } else {
      return [];
    }
  }

  const fetchProfiles = async (pubkeys) => {
    const profiles = Array.from(
      await ndk.fetchEvents({ kinds: [0], authors: pubkeys })
    );
    setTaggedProfiles(profiles.length ? profiles : pubkeys);
  };

  if (content) {
    const links = extractNostrStrings(content);
    if (links) {
      const pubkeys = links.map((link) => {
        if (link.startsWith("npub")) {
          return nip19.decode(link).data;
        }
        return link;
      });
      if (ndk instanceof NDK) {
        fetchProfiles(pubkeys);
      }
    }
  }
  function replaceNostrLinks(inputText, replacementText, pattern) {
    const nostrPattern = pattern;
    return inputText
      .toString()
      ?.replace(
        nostrPattern,
        `[${replacementText}](/${pattern.split(":")[1]})`
      );
  }

  useEffect(() => {
    if (taggedProfiles) {
      taggedProfiles.map((profile) => {
        if (profile instanceof Object) {
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
  const noteId = nip19.decode(note).data;

  const fetchNote = async () => {
    try {
      setRootPost(null);
      setThreadPost(null);
      setIsLoading(true);
      const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
      ndk.connect();
      setNdk(ndk);
      const note = await ndk.fetchEvent({ ids: [noteId] });
      const tagsE = getAllTags(note.tags, "e");
      const rootId = note.tags.find((r) => r[0] === "e");
      if (rootId) {
        note.tags.map((n) => {
          if (!rootId.includes("mention")) {
            return n;
          } else if (rootId.includes("root")) {
            return n;
          }
          return "";
        });
        const rootPost = await ndk.fetchEvent({ ids: [rootId[1]] });
        const rootPostAuthor = await ndk.fetchEvent({
          kinds: [0],
          authors: [rootPost.pubkey],
        });
        setRootPost(rootPost);
        const authorContent = JSON.parse(rootPostAuthor.content);
        setRootPostAuthor(authorContent);
      }

      if (tagsE.length >= 2) {
        for (const e of tagsE) {
          if (e.includes("reply")) {
            const threadId = e[1];
            const threadPost = await ndk.fetchEvent({ ids: [threadId] });
            const threadPostAuthor = await ndk.fetchEvent({
              kinds: [0],
              authors: [threadPost.pubkey],
            });
            const authorContent = JSON.parse(threadPostAuthor.content);
            setThreadPost(threadPost);
            setThreadPostAuthor(authorContent);
          }
        }
      }

      // console.log(note);

      setEvent(note);
      setContent(note.content);
      const author = await ndk.fetchEvent({
        kinds: [0],
        authors: [note.pubkey],
      });
      setAuthor(JSON.parse(author.content));
      setPubkey(author.pubkey);
      setCreatedTime(note.created_at);
      const npub = nip19.npubEncode(note.pubkey);
      const nprofile = nip19.nprofileEncode({ pubkey: note.pubkey });
      setContentJson(
        JSON.stringify(
          {
            pubkey: author.pubkey,
            content: note.content,
            id: note.id,
            created_at: note.created_at,
            kind: "1",
            tags: note.tags,
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
          pubkey: note.pubkey,
          identifier: "",
          relays: ["wss://relay.nostr.band"],
        })
      );
      fetchStats();
      fetchReplies(ndk);
      // console.log(JSON.parse(author.content));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const getMoreZaps = () => {
    setLimitZaps((prevState) => prevState + 10);
  };

  useEffect(() => {
    if (tabKey === "zaps") {
      fetchZaps(noteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitZaps]);

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

  const fetchReplies = async (ndk) => {
    if (ndk instanceof NDK) {
      try {
        const repliesArr = Array.from(
          await ndk.fetchEvents({
            kinds: [1],
            "#e": [noteId],
            limit: limitReplies,
          })
        );

        const authorPks = repliesArr.map((author) => author.pubkey);
        const replies = repliesArr
          .map((reply) => {
            const tagsE = getAllTags(reply.tags, "e");

            const eTag = tagsE.find((r) => r[0] === "e");
            if (!eTag.includes("mention") && tagsE.length === 1) {
              return reply;
            } else if (eTag.includes("root")) {
              return reply;
            } else if (eTag.length <= 3) {
              return reply;
            }
            return "";
          })
          .sort((a, b) => a.created_at - b.created_at);
        setReplies(replies);
        const authors = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            authors: authorPks,
            limit: limitReplies,
          })
        );
        setAuthors(authors);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const fetchZaps = async (eventId) => {
    try {
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
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tabKey === "replies") {
      fetchReplies();
    } else if (tabKey === "zaps") {
      fetchZaps(noteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey]);

  const sats = stats?.zaps?.msats / 1000;

  const closeModal = () => {
    setIsModal(false);
  };

  const zapBtn = async () => {
    const d = document.createElement("div");
    d.setAttribute("data-npub", npubKey);
    d.setAttribute("data-note-id", noteId);
    d.setAttribute("data-relays", "wss://relay.nostr.band");
    window.nostrZap.initTarget(d);
    d.click();
    d.remove();
  };

  return (
    <div className={cl.noteContainer}>
      <EmbedModal
        isModal={isEmbedModal}
        setIsModal={setIsEmbedModal}
        str={note}
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
      {rootPost ? (
        <PostCard
          name={
            rootPostAuthor.display_name
              ? rootPostAuthor.display_name
              : rootPostAuthor.name
          }
          picture={rootPostAuthor.picture}
          eventId={rootPost.id}
          about={rootPost.content}
          pubkey={rootPost.pubkey}
          createdDate={rootPost.created_at}
          ndk={ndk}
        />
      ) : (
        ""
      )}
      {threadPost && threadPostAuthor ? (
        <PostCard
          name={
            threadPostAuthor.display_name
              ? threadPostAuthor.display_name
              : threadPostAuthor.name
          }
          picture={threadPostAuthor.picture}
          eventId={threadPost.id}
          about={threadPost.content}
          pubkey={threadPost.pubkey}
          createdDate={threadPost.created_at}
          thread={
            rootPostAuthor.display_name
              ? rootPostAuthor.display_name
              : rootPostAuthor.name
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
                  : rootPostAuthor.display_name
                  ? rootPostAuthor.display_name
                  : rootPostAuthor.name}
              </p>
            )}
            <div className={cl.noteAuthor}>
              <div className={cl.noteAuthorAvatar}>
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
              <Link className={cl.noteNameLink}>
                {author.display_name ? author.display_name : author.name}
              </Link>
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
              <MarkdownComponent content={content} mode="post" ndk={ndk} />
            </div>
            <div className={cl.noteCreated}>
              <span>{formatAMPM(createdTime * 1000)}</span>
            </div>
            <div className={cl.postStats}>
              {stats?.zaps?.msats && (
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
              <a target="_blanc" href={`https://nostrapp.link/#${npubKey}`}>
                <Button variant="secondary">
                  <BoxArrowUpRight /> Open
                </Button>
              </a>
              <Button variant="secondary" onClick={() => zapBtn()}>
                <Lightning /> Zap
              </Button>
              <Button variant="secondary">
                <Tags /> Label
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
                    href={`https://nostrapp.link/#${npubKey}?select=true`}
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
              onSelect={(k) => setTabKey(k)}
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
                          key={index}
                          author={author}
                          content={reply.content}
                          eventId={reply.id}
                          createdDateAt={reply.created_at}
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
                        const e = rzap.tags.find((item) => item[0] === "e")
                          ? rzap.tags.find((item) => item[0] === "e")[1]
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
  );
};

export default Note;
