import { ZapThreadsAttributes } from "zapthreads";
import "zapthreads";

const Thread = ({ anchor, npub }: { anchor?: string; npub?: string }) => {
  const style = document.createElement("style");
  style.innerHTML =
    ".ztr-comment-new { display: none; } #ztr-title {display: none;} #ztr-root {margin-top: 0}";
  document.querySelector("zap-threads")?.shadowRoot &&
    document.querySelector("zap-threads")?.shadowRoot!.appendChild(style);

  return (
    <zap-threads
      anchor={anchor ?? ""}
      npub={npub ?? ""}
      relays={"wss://relay.nostr.band"}
    />
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
