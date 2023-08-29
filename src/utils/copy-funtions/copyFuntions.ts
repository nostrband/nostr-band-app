import { toast } from "react-toastify";

interface Navigator {
  clipboard: any;
  canShare?: any;
  share?: any;
}
const newNavigator: Navigator = window.navigator;

export const copyUrl = (url: string): void => {
  navigator.clipboard.writeText(url);

  toast.success("Copied", {
    autoClose: 3000,
  });
};

export const copyLink = async (url: string): Promise<void> => {
  const data = { url };
  try {
    if (newNavigator?.canShare && newNavigator?.canShare(data)) {
      await newNavigator?.share(data);
    } else {
      await newNavigator.clipboard.writeText(url);
      toast.success("Copied", {
        autoClose: 3000,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
