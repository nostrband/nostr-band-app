export const copyNpub = (npub) => {
  navigator.clipboard.writeText(npub);
};

export const copyNprofile = (nprofile) => {
  navigator.clipboard.writeText(nprofile);
};

export const copyPubkey = (pubkey) => {
  navigator.clipboard.writeText(pubkey);
};

export const copyLink = async (link) => {
  const data = { link };
  try {
    if (navigator.canShare && navigator.canShare(data)) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(link);
    }
  } catch (err) {
    console.log(err);
  }
};
