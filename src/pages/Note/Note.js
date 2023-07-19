import { useEffect, useState } from "react";
import Search from "../../components/Search/Search";
import cl from "./Note.module.css";
import { Link, useParams } from "react-router-dom";
import { nip19 } from "nostr-tools";
import NDK from "@nostr-dev-kit/ndk";
import UserIcon from "../../assets/user.png";
import {
  copyNprofile,
  copyNpub,
  copyPubkey,
} from "../../utils/copy-funtions/copyFuntions";
import { Dropdown } from "react-bootstrap";
import MarkdownComponent from "../../components/MarkdownComponent/MarkdownComponent";
import { formatAMPM } from "../../utils/formatDate";
import axios from "axios";

const Note = () => {
  const [event, setEvent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ndk, setNdk] = useState({});
  const [pubkey, setPubkey] = useState("");
  const [npubKey, setNpubKey] = useState("");
  const [nprofile, setNprofile] = useState("");
  const [author, setAuthor] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [createdTime, setCreatedTime] = useState("");
  const [stats, setStats] = useState([]);

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
      //   console.log(JSON.parse(author.content));
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
      console.log(data.stats[noteId]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cl.noteContainer}>
      <Search />
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
              <MarkdownComponent content={event.content} />
            </div>
            <div className={cl.noteCreated}>
              <span>{formatAMPM(createdTime * 1000)}</span>
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Note;
