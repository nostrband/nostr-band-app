import { toast } from "react-toastify";

export const copyNpub = (npub) => {
  navigator.clipboard.writeText(npub);

  toast.success("Copied", {
    autoClose: 3000,
  });
};

export const copyNprofile = (nprofile) => {
  navigator.clipboard.writeText(nprofile);

  toast.success("Copied", {
    autoClose: 3000,
  });
};

export const copyPubkey = (pubkey) => {
  navigator.clipboard.writeText(pubkey);

  toast.success("Copied", {
    autoClose: 3000,
  });
};

export const copyLink = async (url) => {
  const data = { url };
  try {
    if (navigator.canShare && navigator.canShare(data)) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Copied", {
        autoClose: 3000,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
