import RouteSwitcher from "./components/RouteSwitcher/RouteSwitcher";
import Home from "./pages/Home/Home";

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
