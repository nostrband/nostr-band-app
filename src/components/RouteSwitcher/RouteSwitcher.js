import { useParams } from "react-router-dom";
import Note from "../../pages/Note/Note";
import Profile from "../../pages/Profile/Profile";

const RouteSwitcher = () => {
  const { router } = useParams();
  if (router.length) {
    if (router.slice(0, 4) === "note") {
      return <Note />;
    } else {
      return <Profile />;
    }
  }
};
export default RouteSwitcher;
