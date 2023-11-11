import { useParams } from "react-router-dom";
import Note from "../../pages/Note/Note";
import Profile from "../../pages/Profile/Profile";

const RouteSwitcher = () => {
  const { router } = useParams();
  if (router) {
    if (router.slice(0, 4) === "note") {
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
