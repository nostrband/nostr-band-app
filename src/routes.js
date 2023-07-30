import RouteSwitcher from "./components/RouteSwitcher/RouteSwitcher";
import Home from "./pages/Home/Home";
import Result from "./pages/Result/Result";

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
