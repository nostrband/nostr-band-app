import { decode } from "light-bolt11-decoder";

export const getZapAmount = (e) => {
  try {
    for (const t of e.tags) {
      if (t.length >= 2 && t[0] === "bolt11") {
        const b = decode(t[1]);
        for (const s of b.sections) {
          if (s.name === "amount") return parseInt(s.value);
        }
        break;
      }
    }
  } catch (er) {
    console.log("Error bad zap", er, e);
  }
  return 0;
};
