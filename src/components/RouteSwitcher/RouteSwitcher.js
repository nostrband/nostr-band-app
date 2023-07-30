import { useParams } from "react-router-dom";
import Note from "../../pages/Note/Note";
import Profile from "../../pages/Profile/Profile";

const RouteSwitcher = () => {
  const { router } = useParams();
  console.log(router);
  if (router.length) {
    if (router.slice(0, 4) === "note") {
      return <Note />;
    } else if (router.slice(0, 4) === "npub") {
      return <Profile />;
    }
  }
};
export default RouteSwitcher;
