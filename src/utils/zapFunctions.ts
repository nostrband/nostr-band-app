import { decode } from "light-bolt11-decoder";
import { ndkEventType } from "../types/types";

export const getZapAmount = (e: ndkEventType): number => {
  try {
    if (e.tags) {
      for (const t of e.tags) {
        if (t.length >= 2 && t[0] === "bolt11") {
          const b = decode(t[1]);
          for (const s of b.sections) {
            if (s.name === "amount") return parseInt(s.value);
          }
          break;
        }
      }
    }
  } catch (er) {
    console.log("Error bad zap", er, e);
  }
  return 0;
};
