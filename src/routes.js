import RouteSwitcher from "./components/RouteSwitcher/RouteSwitcher";
import Home from "./pages/Home/Home";
import Note from "./pages/Note/Note";
import Profile from "./pages/Profile/Profile";

export const allRoutes = [
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/:router",
    Component: RouteSwitcher,
  },
];
