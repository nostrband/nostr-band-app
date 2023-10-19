import "./ProfileItem.css";
import Dropdown from "react-bootstrap/Dropdown";
import {
  CheckCircle,
  Key,
  ZoomIn,
  BoxArrowUpRight,
  PersonPlus,
  Check,
} from "react-bootstrap-icons";
import { Button } from "react-bootstrap";
import { FC, useEffect, useState } from "react";
import axios from "axios";
import { nip19 } from "nostr-tools";
import { Link } from "react-router-dom";
import UserIcon from "../../assets/user.png";
import { copyUrl } from "../../utils/copy-funtions/copyFuntions";
import { getAllTags } from "../../utils/getTags";
import { userSlice } from "../../store/reducers/UserSlice";
import { toast } from "react-toastify";
import { useNostr, dateToUnix } from "nostr-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { profileType, statsType } from "../../types/types";
import AddModal from "../AddModal/AddModal";
import { compareByTagName } from "../../utils/sortFunctions";

type profileItemTypes = {
  img: string;
  name: string;
  bio: string;
  pubKey: string;
  mail: string;
  newFollowersCount: number;
};

const ProfileItem: FC<profileItemTypes> = ({
  img,
  name,
  bio,
  pubKey,
  mail,
  newFollowersCount,
}) => {
  const store = useAppSelector((store) => store.userReducer);
  const { publish } = useNostr();
  const [imgError, setImgError] = useState(false);
  const [stats, setStats] = useState<statsType>({});
  const splitedMail = mail ? mail.toString().split("") : [];
  const npubKey = nip19.npubEncode(pubKey);
  const nprofile = nip19.nprofileEncode({ pubkey: pubKey });
  const [isAddListModal, setIsAddListModal] = useState(false);

  const findMailIndex = splitedMail && splitedMail.findIndex((m) => m === "@");
  const mailName =
    splitedMail && findMailIndex
      ? splitedMail.slice(0, findMailIndex).join("")
      : "";
  const mailAdress =
    splitedMail && findMailIndex
      ? splitedMail.slice(findMailIndex + 1).join("")
      : "";
  const { setContacts, setLists } = userSlice.actions;

  const dispatch = useAppDispatch();

  const fetchStats = async () => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_URL}/stats/profile/${pubKey}`
    );

    setStats(data.stats[pubKey]);
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagsP = store.contacts
    ? Array.isArray(store.contacts.tags)
      ? getAllTags(store.contacts.tags, "p")
      : null
    : "";
  const followedPubkeys = Array.isArray(tagsP)
    ? tagsP.map((tag) => tag[1])
    : [];

  const sats =
    stats?.zaps_received?.msats && stats?.zaps_received?.msats / 1000;

  const onFollow = async () => {
    if (localStorage.getItem("login")) {
      try {
        if (!followedPubkeys.includes(pubKey)) {
          const msg = {
            content: "",
            kind: 3,
            tags: store.contacts?.tags
              ? [...store.contacts.tags, ["p", pubKey]]
              : [["p", pubKey]],
            created_at: dateToUnix(),
          };

          //@ts-ignore
          const event = await window.nostr!.signEvent(msg);
          //@ts-ignore
          publish(event);
          dispatch(setContacts(event));
        } else {
          const msg = {
            content: "",
            kind: 3,
            tags: store.contacts?.tags && [
              ...store.contacts.tags.filter((pk) => pk[1] !== pubKey),
            ],
            created_at: dateToUnix(),
          };

          //@ts-ignore
          const event = await window.nostr!.signEvent(msg);
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

  const profile: profileType = {
    pubkey: pubKey,
    display_name: name,
    picture: img,
    about: bio,
    image: img,
  };

  const handleList = async (listId: string) => {
    const list = store.lists.find((list) => list.id === listId);
    const listPubkeys = list && getAllTags(list.tags, "p").map((p) => p[1]);
    try {
      if (listPubkeys?.includes(pubKey)) {
        const newList = list?.tags.filter((list) => list[1] !== pubKey);
        const msg = {
          kind: 30000,
          tags: newList,
          content: "",
          created_at: dateToUnix(),
          pubkey: localStorage.getItem("login")!,
        };
        //@ts-ignore
        const res = await window!.nostr!.signEvent(msg);
        //@ts-ignore
        publish(res);
        const updatedList = store.lists.map((l) => {
          if (l.id !== listId) {
            return l;
          }
          return res;
        });
        dispatch(setLists(updatedList));
      } else {
        const newList = [...list?.tags!, ["p", pubKey]];
        const msg = {
          kind: 30000,
          tags: newList,
          content: "",
          created_at: dateToUnix(),
          pubkey: localStorage.getItem("login")!,
        };
        //@ts-ignore
        const res = await window!.nostr!.signEvent(msg);
        //@ts-ignore
        publish(res);
        const updatedList = store.lists.map((l) => {
          if (l.id !== listId) {
            return l;
          }
          return res;
        });
        dispatch(setLists(updatedList));
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="profile">
      <AddModal
        isModal={isAddListModal}
        setIsModal={setIsAddListModal}
        selectedProfile={profile}
        selectedProfilePubkey={pubKey}
        type="list"
      />
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
            <Link to={`/${npubKey}`} className="profile-info__hero-name">
              {name}
            </Link>
            <Dropdown id="profile-dropdown" className="profile-dropdown">
              <Dropdown.Toggle size="sm" id="dropdown-basic"></Dropdown.Toggle>
              <Dropdown.Menu
                variant={store.theme === "dark" ? "dark" : "light"}
              >
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
                onClick={() => copyUrl(mail)}
                className="profile-info__hero-keys-mail"
              >
                {mailName === "_"
                  ? mailName.replace("_", "")
                  : mailName.slice(0, 9)}
                {mailName.length >= 11 && "..."}
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
              onClick={() => copyUrl(npubKey)}
              className="profile-info__hero-keys-key"
            >
              <Key /> {npubKey.slice(0, 8)}...{npubKey.slice(-4)}
            </a>
          </div>
          <div className="profile-info__hero-sats">
            {sats && (
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

      <div className="profile-content__control">
        <Link to={`/${npubKey}`}>
          <Button variant="outline-secondary">
            <ZoomIn /> View
          </Button>
        </Link>
        <a target="_blanc" href={`https://nostrapp.link/#${npubKey}`}>
          <Button variant="outline-secondary">
            <BoxArrowUpRight /> Open
          </Button>
        </a>

        <Button
          variant={`${
            followedPubkeys.includes(pubKey)
              ? "outline-success"
              : "outline-secondary"
          }`}
          onClick={onFollow}
        >
          <PersonPlus />{" "}
          {followedPubkeys.includes(pubKey) ? "Followed" : "Follow"}
        </Button>
        <Dropdown>
          <Dropdown.Toggle
            variant={`${
              store.lists.some((list) => {
                const pksOfList = getAllTags(list.tags, "p").map((p) => p[1]);
                if (pksOfList.includes(pubKey)) {
                  return true;
                }
              })
                ? "outline-success"
                : "outline-secondary"
            }`}
            style={{ alignItems: "center" }}
          >
            List
          </Dropdown.Toggle>

          <Dropdown.Menu variant={store.theme === "dark" ? "dark" : "light"}>
            {store.lists &&
              store.isAuth &&
              store.lists
                .slice()
                .sort(compareByTagName)
                .map((list, index) => {
                  const listLabel = getAllTags(list.tags, "d").flat();
                  const pksOfList = getAllTags(list.tags, "p").map((p) => p[1]);
                  if (
                    pksOfList.includes(pubKey) &&
                    !listLabel[1].startsWith("notifications") &&
                    !listLabel[1].startsWith("chats")
                  ) {
                    return (
                      <Dropdown.Item
                        key={index}
                        onClick={() => handleList(list.id)}
                      >
                        {pksOfList.includes(pubKey) && <Check />} {listLabel[1]}{" "}
                        <strong>{pksOfList.length}</strong>
                      </Dropdown.Item>
                    );
                  }
                  return null;
                })}
            {store.lists &&
              store.isAuth &&
              store.lists
                .slice()
                .sort(compareByTagName)
                .map((list, index) => {
                  const listLabel = getAllTags(list.tags, "d").flat();
                  const pksOfList = getAllTags(list.tags, "p").map((p) => p[1]);
                  if (
                    !pksOfList.includes(pubKey) &&
                    !listLabel[1].startsWith("notifications") &&
                    !listLabel[1].startsWith("chats")
                  ) {
                    return (
                      <Dropdown.Item
                        key={index}
                        onClick={() => handleList(list.id)}
                      >
                        {pksOfList.includes(pubKey) && <Check />} {listLabel[1]}{" "}
                        <strong>{pksOfList.length}</strong>
                      </Dropdown.Item>
                    );
                  }
                  return null;
                })}
            {/* {store.lists &&
              store.isAuth &&
              store.lists.map((list, index) => {
                const listLabel = getAllTags(list.tags, "d").flat();
                const pksOfList = getAllTags(list.tags, "p").map((p) => p[1]);

                return !(
                  listLabel[1].startsWith("notifications") ||
                  listLabel[1].startsWith("chats")
                ) ? (
                  <Dropdown.Item
                    key={index}
                    onClick={() => handleList(list.id)}
                  >
                    {pksOfList.includes(pubKey) && <Check />} {listLabel[1]}{" "}
                    <strong>{pksOfList.length}</strong>
                  </Dropdown.Item>
                ) : null;
              })} */}
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setIsAddListModal(true)}>
              New List
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default ProfileItem;
