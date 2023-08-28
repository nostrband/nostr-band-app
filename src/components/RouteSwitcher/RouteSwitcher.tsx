import { useParams } from "react-router-dom";
import Note from "../../pages/Note/Note";
import Profile from "../../pages/Profile/Profile";
import React from "react";

const RouteSwitcher = () => {
  const { router } = useParams();
  if (router) {
    if (router.slice(0, 4) === "note") {
      return <Note />;
    } else if (router.slice(0, 4) === "npub") {
      return <Profile />;
    }
  }
};
export default RouteSwitcher;
