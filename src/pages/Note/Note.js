import { useEffect, useState } from "react";
import Search from "../../components/Search/Search";
import cl from "./Note.module.css";
import { Link, useParams } from "react-router-dom";
import { nip19 } from "nostr-tools";
import NDK from "@nostr-dev-kit/ndk";
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
} from "react-bootstrap-icons";
import {
  copyNprofile,
  copyNpub,
  copyPubkey,
} from "../../utils/copy-funtions/copyFuntions";
import { Button, Dropdown, Tab, Tabs } from "react-bootstrap";
import MarkdownComponent from "../../components/MarkdownComponent/MarkdownComponent";
import { formatAMPM } from "../../utils/formatDate";
import axios from "axios";
import NoteSkeleton from "./NoteSkeleton/NoteSkeleton";
import Reply from "../../components/Reply/Reply";

const Note = () => {
  const [event, setEvent] = useState([]);
  const [tabKey, setTabKey] = useState("replies");
  const [isLoading, setIsLoading] = useState(false);
  const [ndk, setNdk] = useState({});
  const [pubkey, setPubkey] = useState("");
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [author, setAuthor] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [createdTime, setCreatedTime] = useState("");
  const [repliesCount, setRepliesCount] = useState("");
  const [stats, setStats] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [replies, setReplies] = useState([]);

  const { note } = useParams();
  const noteId = nip19.decode(note).data;

  const fetchNote = async () => {
    try {
      setIsLoading(true);
      const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
      ndk.connect();
      setNdk(ndk);
      const note = await ndk.fetchEvent({ ids: [noteId] });
      setEvent(note);
      const author = await ndk.fetchEvent({
        kinds: [0],
        authors: [note.pubkey],
      });
      setAuthor(JSON.parse(author.content));
      setPubkey(author.pubkey);
      setCreatedTime(note.created_at);
      const npub = nip19.npubEncode(note.pubkey);
      const nprofile = nip19.nprofileEncode({ pubkey: note.pubkey });
      setNpubKey(npub);
      setNprofile(nprofile);
      fetchStats();
      fetchReplies(ndk);
      //   console.log(JSON.parse(author.content));
      setIsLoading(false);
    } catch (e) {
      console.log(e);
    }
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
    } catch (e) {
      console.log(e);
    }
  };

  const fetchReplies = async (ndk) => {
    if (ndk) {
      try {
        const repliesArr = Array.from(
          await ndk.fetchEvents({ kinds: [1], "#e": [noteId], limit: 100 })
        );

        const authorPks = repliesArr.map((author) => author.pubkey);
        const replies = repliesArr.map((reply) => {
          const eTag = reply.tags.find((r) => r[0] === "e");
          reply.tags.find((rep) => rep[0][1] === noteId);
          // console.log(eTag);
          if (!eTag.includes("mention")) {
            return reply;
          }
          return "";
        });
        // console.log(replies);
        setReplies(replies);

        const authors = Array.from(
          await ndk.fetchEvents({ kinds: [0], authors: authorPks, limit: 100 })
        );
        setAuthors(authors);
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tabKey === "replies") {
      fetchReplies();
    }
  }, [tabKey]);

  const sats = stats?.zaps?.msats / 1000;

  return (
    <div className={cl.noteContainer}>
      <Search isLoading={isLoading} />
      <h2>Note</h2>
      {event ? (
        <>
          <div className={cl.note}>
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
                  <Dropdown.Item onClick={() => copyNpub(npubKey)}>
                    Copy npub
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyNprofile(nprofile)}>
                    Copy nprofile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => copyPubkey(pubkey)}>
                    Copy pubkey
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div>
              <MarkdownComponent content={event.content} mode="post" />
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
              <Button variant="secondary">
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
                    href={`https://nostrapp.link/#${npubKey}`}
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
                  <Dropdown.Item onClick={() => copyNpub(npubKey)}>
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
                  ? replies.map((reply) => {
                      const author = authors.find(
                        (author) => author.pubkey === reply.pubkey
                      );
                      const authorContent = author
                        ? JSON.parse(author.content)
                        : "";

                      return reply ? (
                        <Reply
                          key={reply.id}
                          author={authorContent}
                          content={reply.content}
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
                  </span>
                }
              ></Tab>
              <Tab
                eventKey="zaps-sent"
                title={
                  <span className="d-flex align-items-center">
                    <LightningFill />
                    sent&nbsp;
                  </span>
                }
              ></Tab>
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
