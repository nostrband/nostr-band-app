import { useEffect } from "react";
import { ZapThreadsAttributes } from "zapthreads";
import "zapthreads";

const Thread = ({ anchor }: { anchor?: string }) => {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML =
      ".ztr-comment-new { display: none; } #ztr-title {display: none;} #ztr-root {margin-top: 0} .ztr-comment-actions {display: none !important;} .ztr-comment-body {padding: .5rem;}";
    document.querySelector("zap-threads")?.shadowRoot &&
      document.querySelector("zap-threads")?.shadowRoot!.appendChild(style);
  }, [anchor]);

  return (
    <zap-threads anchor={anchor ?? ""} relays={"wss://relay.nostr.band"} />
  );
};

export default Thread;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "zap-threads": ZapThreadsAttributes;
    }
  }
}
