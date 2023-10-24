import RouteSwitcher from "./components/RouteSwitcher/RouteSwitcher";
import Home from "./pages/Home/Home";
import Trending from "./pages/Trending/Trending";

export const allRoutes = [
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/trending/:type/:date",
    Component: Trending,
  },
  {
    path: "/:router",
    Component: RouteSwitcher,
  },
];
