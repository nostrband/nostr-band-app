import { useParams } from "react-router-dom";
import Note from "../../pages/Note/Note";
import Profile from "../../pages/Profile/Profile";

const RouteSwitcher = () => {
  let { router } = useParams();
  if (router) {
    if (router.startsWith("nostr:")) router = router.substring(6);
    console.log("router", router);
    if (
      router.slice(0, 4) === "note" ||
      router.slice(0, 5) === "naddr" ||
      router.slice(0, 6) === "nevent"
    ) {
      return <Note />;
    } else if (
      router.slice(0, 4) === "npub" ||
      router.slice(0, 8) === "nprofile"
    ) {
      return <Profile />;
    }
    return <div>Not Found</div>;
  }
  return null;
};
export default RouteSwitcher;
