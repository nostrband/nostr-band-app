import { useState, useEffect } from "react";
import NDK, { NDKEvent } from "@nostrband/ndk";
import { getZapAmount } from "../../../utils/zapFunctions";
import { useSearchParams } from "react-router-dom";
import ZapTransfer from "../../../components/ZapTransfer/ZapTransfer";
import cl from "./Zaps.module.css";
import Search from "../../../components/Search/Search";

const Zaps = () => {
  const [ndk, setNdk] = useState<NDK>();
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
      if (zapsCount - receivedZaps.length) {
        getMoreZaps();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBottom]);

  useEffect(() => {
    if (ndk instanceof NDK) {
      getZaps(ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitZaps]);

  useEffect(() => {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    setNdk(ndk);
    getZaps(ndk);
    fetchZapsCount(ndk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ndk instanceof NDK) {
      getZaps(ndk);
      fetchZapsCount(ndk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("q")]);

  const fetchZapsCount = async (ndk: NDK) => {
    if (ndk instanceof NDK) {
      const zapsCount = await ndk.fetchCount({
        kinds: [9735],
        //@ts-ignore
        search: searchParams.get("q"),
      });
      setZapsCount(zapsCount?.count ? zapsCount.count : 0);
    }
  };

  const getZaps = async (ndk: NDK) => {
    if (ndk instanceof NDK) {
      try {
        setIsLoading(true);
        const zaps = Array.from(
          await ndk.fetchEvents({
            kinds: [9735],
            //@ts-ignore
            search: searchParams.get("q"),
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
