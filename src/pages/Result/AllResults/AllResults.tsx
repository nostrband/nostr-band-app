import NDK, { NDKEvent } from "@nostrband/ndk";
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import CardSkeleton from "../../../components/CardSkeleton/CardSkeleton";
import PostCard from "../../../components/PostCard/PostCard";
import ProfileItem from "../../../components/ProfileItem/ProfileItem";
import { useAppSelector } from "../../../hooks/redux";
import cl from "./AllResults.module.css";
import Search from "../../../components/Search/Search";
import { dateToUnix } from "nostr-react";
import { nip19 } from "@nostrband/nostr-tools";
import { getZapAmount } from "../../../utils/zapFunctions";
import ZapTransfer from "../../../components/ZapTransfer/ZapTransfer";
import { getTag } from "../../../utils/getTags";
import { getKindName } from "../../../utils/helper";

const AllResults = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<NDKEvent[]>([]);
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(false);
  const [posts, setPosts] = useState<NDKEvent[]>([]);
  const [postsAuthors, setPostsAuthors] = useState<NDKEvent[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [taggedProfiles, setTaggedProfiles] = useState<(NDKEvent | string)[]>(
    []
  );
  const [isBottom, setIsBottom] = useState(false);
  const [eventsCount, setEventsCount] = useState(0);
  const [limitEvents, setLimitEvents] = useState(10);
  const [receivedZaps, setReceivedZaps] = useState<NDKEvent[]>([]);
  const [amountReceivedZaps, setAmountReceivedZaps] = useState<number[]>([]);
  const [sentAuthors, setSentAuthors] = useState<NDKEvent[]>([]);
  const [createdTimes, setCreatedTimes] = useState<number[]>([]);
  const [sendersComments, setSendersComments] = useState<any[]>([]);
  const [zappedPosts, setZappedPosts] = useState<NDKEvent[]>([]);
  const [providers, setProviders] = useState<NDKEvent[]>([]);
  const [receiverAuthors, setReceiverAuthors] = useState<NDKEvent[]>([]);
  const search = searchParams.get("q");
  const kindsList = searchParams
    .get("q")
    ?.match(/kind:\d+/g)
    ?.map((kind) => parseInt(kind.split(":")[1]));

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
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ndk instanceof NDK) {
      if (limitEvents !== 10) {
        setLimitEvents(10);
      } else {
        fetchEvents();
        getProfiles();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  useEffect(() => {
    if (ndk instanceof NDK) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitEvents]);

  useEffect(() => {
    if (isBottom) {
      if (eventsCount - receivedZaps.length && !isLoadingPosts) {
        getMoreEvents();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  const getMoreEvents = () => {
    setLimitEvents((prevState) => prevState + 10);
  };

  const cleanSearch = useMemo(() => {
    return search
      ?.split(" ")
      .filter((str) =>
        str.includes("following:")
          ? !str.match(/following:npub[0-9a-zA-Z]+/g)
          : !str.match(/by:npub[0-9a-zA-Z]+/g)
      )
      .join(" ")
      .replace(/#[a-zA-Z0-9_]+/g, "")
      .replace(/lang:[a-zA-Z0-9_]+/g, "")
      .replace(/since:\d{4}-\d{2}-\d{2}/, "")
      .replace(/until:\d{4}-\d{2}-\d{2}/, "")
      .replace(/kind:\d+/g, "");
  }, [search]);

  const tagsWithHash = search
    ?.split(" ")
    .filter((s) => s.match(/#[a-zA-Z0-9_]+/g)?.toString());
  const tags = tagsWithHash?.map((tag) => tag.replace("#", ""));
  const langsWithPrefix = search
    ?.split(" ")
    .filter((s) => s.match(/lang:[a-zA-Z]+/g)?.toString());
  const langs = langsWithPrefix?.map((lang) => lang.replace("lang:", ""));
  const since = search?.match(/since:\d{4}-\d{2}-\d{2}/)
    ? dateToUnix(
        new Date(
          search?.match(/since:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
        )
      )
    : "";
  const until = search?.match(/until:\d{4}-\d{2}-\d{2}/)
    ? dateToUnix(
        new Date(
          search?.match(/until:\d{4}-\d{2}-\d{2}/)![0].replace(/-/g, "/")
        )
      )
    : "";

  const getProfiles = async () => {
    if (ndk instanceof NDK) {
      setIsLoadingProfiles(true);
      const filter = { kinds: [0], limit: 3 };
      if (cleanSearch?.trim()) {
        Object.defineProperty(filter, "search", {
          value: cleanSearch.trimStart().trimEnd(),
          enumerable: true,
        });
      }

      if (tags?.length) {
        Object.defineProperty(filter, "#t", {
          value: tags,
          enumerable: true,
        });
      }

      if (since) {
        Object.defineProperty(filter, "since", {
          value: since,
          enumerable: true,
        });
        if (!until) {
          Object.defineProperty(filter, "until", {
            value: dateToUnix(new Date()),
            enumerable: true,
          });
        }
      }

      if (until) {
        Object.defineProperty(filter, "until", {
          value: until,
          enumerable: true,
        });
      }

      if (langs?.length) {
        Object.defineProperty(filter, "@lang", {
          value: langs,
          enumerable: true,
        });
      }
      if (search?.includes("following:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";

        //@ts-ignore
        const userContacts = await ndk.fetchEvent({
          kinds: [3],
          authors: [userPk],
        });
        const followingPubkeys = userContacts
          ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
          : [];

        if (followingPubkeys.length) {
          Object.defineProperty(filter, "authors", {
            value: followingPubkeys,
            enumerable: true,
          });
        }

        const topProfilesIds = await ndk.fetchTop(filter);
        const topProfiles = Array.from(
          //@ts-ignore
          await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
        );
        setProfiles(topProfiles);
        setProfilesCount(userContacts?.tags?.length ?? 0);
      } else if (search?.includes("by:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";
        if (userPk) {
          Object.defineProperty(filter, "authors", {
            value: [userPk],
            enumerable: true,
          });
        }

        //@ts-ignore
        const user = await ndk.fetchEvent(filter);
        setProfiles(user ? [user] : []);

        setProfilesCount(1);
      } else {
        const topProfilesIds = await ndk.fetchTop(filter);

        const topProfiles = topProfilesIds
          ? Array.from(
              //@ts-ignore
              await ndk.fetchEvents({ kinds: [0], ids: topProfilesIds.ids })
            )
          : [];
        setProfiles(topProfiles);
        const countFilter = { ...filter, limit: 10000 };
        const profilesCount = await ndk.fetchCount(countFilter);
        setProfilesCount(profilesCount?.count ?? 0);
      }
      setIsLoadingProfiles(false);
    }
  };

  const fetchEvents = async () => {
    if (ndk instanceof NDK) {
      setIsLoadingPosts(true);
      const filter = { kinds: kindsList ?? [1], limit: limitEvents };
      console.log(filter);

      if (cleanSearch?.trim()) {
        Object.defineProperty(filter, "search", {
          value: cleanSearch.trimStart().trimEnd(),
          enumerable: true,
        });
      }

      if (tags?.length) {
        Object.defineProperty(filter, "#t", {
          value: tags,
          enumerable: true,
        });
      }

      if (since) {
        Object.defineProperty(filter, "since", {
          value: since,
          enumerable: true,
        });
        if (!until) {
          Object.defineProperty(filter, "until", {
            value: dateToUnix(new Date()),
            enumerable: true,
          });
        }
      }

      if (until) {
        Object.defineProperty(filter, "until", {
          value: until,
          enumerable: true,
        });
      }

      if (langs?.length) {
        Object.defineProperty(filter, "@lang", {
          value: langs,
          enumerable: true,
        });
      }
      if (search?.includes("following:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data : "";

        //@ts-ignore
        const userContacts = await ndk.fetchEvent({
          kinds: [3],
          authors: [userPk],
        });
        const followingPubkeys = userContacts
          ? userContacts?.tags.slice(0, 500).map((contact) => contact[1])
          : [];

        if (followingPubkeys.length) {
          Object.defineProperty(filter, "authors", {
            value: followingPubkeys,
            enumerable: true,
          });
        }
        //@ts-ignore
        const posts = Array.from(await ndk.fetchEvents(filter));
        const countFilter = { ...filter, limit: 10000 };
        //@ts-ignore
        const eventsCount = await ndk.fetchCount(countFilter);
        setEventsCount(eventsCount?.count ?? 0);

        const postsAuthorsPks = posts.map((post) => post.pubkey);
        const postsAuthors = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            authors: postsAuthorsPks,
            limit: 10,
          })
        );
        // fetchTaggedUsers(posts);
        setPosts(posts);
        setPostsAuthors(postsAuthors);
      } else if (search?.includes("by:")) {
        const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
        const userPk = userNpub ? nip19.decode(userNpub).data.toString() : "";

        if (userPk) {
          Object.defineProperty(filter, "authors", {
            value: [userPk],
            enumerable: true,
          });
        }

        console.log("postsFilter", filter);

        //@ts-ignore
        const posts = Array.from(await ndk.fetchEvents(filter));
        // fetchTaggedUsers(posts);
        const countFilter = { ...filter, limit: 10000 };
        //@ts-ignore
        const eventsCount = await ndk.fetchCount(countFilter);
        setEventsCount(eventsCount?.count ?? 0);

        const postsAuthorsPks = posts.map((post) => post.pubkey);
        const postsAuthors = Array.from(
          await ndk.fetchEvents({
            kinds: [0],
            authors: postsAuthorsPks,
            limit: 10,
          })
        );
        setPosts(posts);
        setPostsAuthors(postsAuthors);
      } else {
        //@ts-ignore
        const events = Array.from(await ndk.fetchEvents(filter));
        // fetchTaggedUsers(posts);
        const postsAuthorsPks = events.map((event) => event.pubkey);
        const postsAuthors = Array.from(
          await ndk.fetchEvents({ kinds: [0], authors: postsAuthorsPks })
        );

        // console.log(posts);

        const zaps = events.filter((event) => event.kind === 9735);
        setReceivedZaps(zaps);
        const providersPubkyes = zaps.map((zap) => zap.pubkey);
        const providers = providersPubkyes.length
          ? Array.from(
              await ndk.fetchEvents({
                kinds: [0],
                authors: providersPubkyes,
                limit: limitEvents,
              })
            )
          : [];

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
        const zappedPosts = postsIds.length
          ? Array.from(
              await ndk.fetchEvents({
                kinds: [1],
                ids: postsIds,
                limit: limitEvents,
              })
            )
          : [];
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

        const sendersArr = sendersPubkeys.length
          ? Array.from(
              await ndk.fetchEvents({
                kinds: [0],
                authors: sendersPubkeys,
                limit: limitEvents,
              })
            )
          : [];

        // console.log(sendersArr);
        const senders = sendersArr.map((sender) => {
          return sender;
        });
        setSentAuthors(senders);

        const receiversPubkeys = zaps.map((zap) => {
          return zap.tags.find((item) => item[0] === "p")![1];
        });

        const receiversArr = receiversPubkeys.length
          ? Array.from(
              await ndk.fetchEvents({
                kinds: [0],
                authors: receiversPubkeys,
                limit: limitEvents,
              })
            )
          : [];

        const receivers = receiversArr.map((receiver) => {
          return receiver;
        });
        setReceiverAuthors(receivers);

        setPosts(events);
        setPostsAuthors(postsAuthors);
        const countFilter = { ...filter, limit: 10000 };
        //@ts-ignore
        const eventsCount = await ndk.fetchCount(countFilter);
        setEventsCount(eventsCount?.count ?? 0);
      }
      setIsLoadingPosts(false);
    }
  };
  let indexOfZaps = -1;
  const navigate = useNavigate();

  return (
    <div className={cl.result}>
      <Search isLoading={isLoadingPosts} />
      {!isLoadingProfiles ? (
        profiles?.length ? (
          <div className={cl.resultProfiles}>
            <h2>Profiles</h2>
            {profiles.map((profile) => {
              const profileContent = JSON.parse(profile.content);
              return (
                <ProfileItem
                  img={profileContent.picture}
                  pubKey={profile.pubkey}
                  bio={profileContent.about}
                  name={
                    profileContent.display_name
                      ? profileContent.display_name
                      : profileContent.name
                  }
                  key={profile.id}
                  mail={profileContent.nip05}
                  newFollowersCount={0}
                />
              );
            })}
          </div>
        ) : (
          ""
        )
      ) : (
        <CardSkeleton cards={3} />
      )}
      {profilesCount >= 4 && (
        <Button
          variant="link"
          className={cl.moreLink}
          onClick={() =>
            navigate(`/?q=${search?.replace(/kind:\d+/g, "")} kind:0`)
          }
        >
          And {profilesCount ? profilesCount : 0} more profiles →
        </Button>
      )}
      {posts?.length ? (
        <div className={cl.resPosts}>
          <h2>Results</h2>
          {posts.map((post) => {
            if (post.kind === 9735) {
              indexOfZaps++;
              const cleanJSON = post.tags
                .find((item) => item[0] === "description")![1]
                .replace(/[^\x20-\x7E]/g, "");
              const pk = JSON.parse(cleanJSON).pubkey;
              const sender = sentAuthors.find((item) => {
                return item.pubkey === pk;
              });
              const senderContent = sender ? JSON.parse(sender.content) : "";

              const zappedPost = zappedPosts.find((item) => {
                const e = post.tags.find((item) => item[0] === "e")
                  ? post.tags.find((item) => item[0] === "e")![1]
                  : "";
                return item.id === e;
              });

              const pr = providers.find(
                (provider) => provider.pubkey === post.pubkey
              );
              const provider = pr ? JSON.parse(pr.content) : "";

              const pkey = post.tags.find((item) => item[0] === "p")![1];

              const receiver = receiverAuthors.find(
                (item) => item.pubkey === pkey
              );

              const receiverContent = receiver
                ? JSON.parse(receiver.content)
                : "";

              return (
                <ZapTransfer
                  key={indexOfZaps}
                  created={createdTimes[indexOfZaps]}
                  sender={senderContent}
                  amount={amountReceivedZaps[indexOfZaps]}
                  receiver={receiverContent}
                  comment={sendersComments[indexOfZaps]}
                  zappedPost={zappedPost ? zappedPost.content : ""}
                  provider={provider}
                  eventId={zappedPost ? zappedPost?.id : ""}
                  senderPubkey={pk}
                  mode={""}
                />
              );
            } else if (post.kind === 1) {
              const postAuthor = postsAuthors.find(
                (author) => author.pubkey === post.pubkey
              );
              const authorContent = postAuthor
                ? JSON.parse(postAuthor.content)
                : {};

              return (
                <PostCard
                  taggedProfiles={taggedProfiles}
                  key={post.id}
                  name={
                    authorContent.display_name
                      ? authorContent.display_name
                      : authorContent.name
                  }
                  picture={authorContent.picture}
                  about={post.content}
                  pubkey={post.pubkey}
                  eventId={post.id}
                  createdDate={post.created_at ? post.created_at : 0}
                  thread={""}
                />
              );
            } else {
              const postAuthor = postsAuthors.find(
                (author) => author.pubkey === post.pubkey
              );
              const authorContent = postAuthor
                ? JSON.parse(postAuthor.content)
                : {};
              const title = getTag(post.tags, ["title", "name"]);
              const body = getTag(post.tags, [
                "summary",
                "description",
                "alt",
              ]).slice(0, 300);

              return (
                <PostCard
                  kindName={getKindName(post.kind ?? 0)}
                  taggedProfiles={taggedProfiles}
                  key={post.id}
                  name={
                    authorContent.display_name
                      ? authorContent.display_name
                      : authorContent.name
                  }
                  picture={authorContent.picture}
                  about={body ?? post.content}
                  title={title}
                  pubkey={post.pubkey}
                  eventId={post.id}
                  createdDate={post.created_at ? post.created_at : 0}
                  thread={""}
                />
              );
            }
          })}
        </div>
      ) : (
        ""
      )}
      {!isLoadingProfiles &&
        !isLoadingPosts &&
        !posts.length &&
        !profiles.length && <div>Nothing found :(</div>}
    </div>
  );
};

export default AllResults;
