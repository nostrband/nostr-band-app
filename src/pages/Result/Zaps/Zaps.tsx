import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import NDK, { NDKEvent } from "@nostrband/ndk";
import { getZapAmount } from "../../../utils/zapFunctions";
import { useSearchParams } from "react-router-dom";
import ZapTransfer from "../../../components/ZapTransfer/ZapTransfer";
import cl from "./Zaps.module.css";
import Search from "../../../components/Search/Search";
import { useAppSelector } from "../../../hooks/redux";
import { dateToUnix } from "nostr-react";
import { nip19 } from "@nostrband/nostr-tools";

const Zaps = () => {
  const ndk = useAppSelector((store) => store.connectionReducer.ndk);
  const [searchParams] = useSearchParams();
  const [receivedZaps, setReceivedZaps] = useState<NDKEvent[]>([]);
  const [amountReceivedZaps, setAmountReceivedZaps] = useState<number[]>([]);
  const [sentAuthors, setSentAuthors] = useState<NDKEvent[]>([]);
  const [createdTimes, setCreatedTimes] = useState<number[]>([]);
  const [sendersComments, setSendersComments] = useState<any[]>([]);
  const [zappedPosts, setZappedPosts] = useState<NDKEvent[]>([]);
  const [providers, setProviders] = useState<NDKEvent[]>([]);
  const [receiverAuthors, setReceiverAuthors] = useState<NDKEvent[]>([]);
  const [zapsCount, setZapsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [limitZaps, setLimitZaps] = useState(10);
  const [isBottom, setIsBottom] = useState(false);
  const search = searchParams.get("q");
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
      .replace(/until:\d{4}-\d{2}-\d{2}/, "");
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

  const filter = { kinds: [9735], limit: limitZaps };

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
    if (isBottom) {
      if (zapsCount - receivedZaps.length && !isLoading) {
        getMoreZaps();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  useEffect(() => {
    if (ndk instanceof NDK) {
      getZaps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitZaps, searchParams.get("q")]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (cleanSearch?.trim()) {
    Object.defineProperty(filter, "search", {
      value: cleanSearch.trimStart().trimEnd(),
      enumerable: true,
    });
  }

  if (tags?.length) {
    Object.defineProperty(filter, "t", {
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

  const getZaps = async () => {
    if (ndk instanceof NDK) {
      try {
        setIsLoading(true);
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
        } else if (search?.includes("by:")) {
          const userNpub = search?.match(/npub[0-9a-zA-Z]+/g)![0];
          const userPk = userNpub ? nip19.decode(userNpub).data : "";
          if (userPk) {
            Object.defineProperty(filter, "@zs", {
              value: [userPk],
              enumerable: true,
            });
          }
        }
        const zaps = Array.from(await ndk.fetchEvents(filter));
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

        const receiversPubkeys = zaps.map((zap) => {
          return zap.tags.find((item) => item[0] === "p")![1];
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
        const zapsCount = await ndk.fetchCount(filter);
        setZapsCount(zapsCount?.count ?? 0);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getMoreZaps = () => {
    setLimitZaps((prevState) => prevState + 10);
  };

  return (
    <div>
      <Search isLoading={isLoading} />
      <h2 className={cl.prTitle}>
        Zaps <br />
        <span>found {zapsCount} zaps</span>
      </h2>
      {receivedZaps.length && createdTimes.length
        ? receivedZaps.map((author, index) => {
            const cleanJSON = author.tags
              .find((item) => item[0] === "description")![1]
              .replace(/[^\x20-\x7E]/g, "");
            const pk = JSON.parse(cleanJSON).pubkey;
            const sender = sentAuthors.find((item) => {
              return item.pubkey === pk;
            });
            const senderContent = sender ? JSON.parse(sender.content) : "";

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

            const pkey = author.tags.find((item) => item[0] === "p")![1];

            const receiver = receiverAuthors.find(
              (item) => item.pubkey === pkey
            );

            const receiverContent = receiver
              ? JSON.parse(receiver.content)
              : "";

            return (
              <ZapTransfer
                key={index}
                created={createdTimes[index]}
                sender={senderContent}
                amount={amountReceivedZaps[index]}
                receiver={receiverContent}
                comment={sendersComments[index]}
                zappedPost={zappedPost ? zappedPost.content : ""}
                provider={provider}
                eventId={zappedPost ? zappedPost?.id : ""}
                senderPubkey={pk}
                mode={""}
              />
            );
          })
        : ""}
      {isLoading && <p>Loading...</p>}
      {zapsCount - receivedZaps.length === 0 && <p>End of results</p>}
    </div>
  );
};

export default Zaps;
