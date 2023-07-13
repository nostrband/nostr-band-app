import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";

export const allRoutes = [
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/:npub",
    Component: Profile,
  },
];
