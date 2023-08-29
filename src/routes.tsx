//@ts-ignore
import RouteSwitcher from "./components/RouteSwitcher/RouteSwitcher.tsx";
//@ts-ignore
import Home from "./pages/Home/Home.tsx";

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
