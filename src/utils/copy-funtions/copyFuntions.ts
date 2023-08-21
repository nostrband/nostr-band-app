import { toast } from "react-toastify";

export const copyUrl = (url: string): void => {
  navigator.clipboard.writeText(url);

  toast.success("Copied", {
    autoClose: 3000,
  });
};

export const copyLink = async (url: string): Promise<void> => {
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
