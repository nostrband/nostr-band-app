import "./Header.css";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userSlice } from "../../store/reducers/UserSlice";
import { FC } from "react";
import { useAppSelector } from "../../hooks/redux";
import { nip19 } from "@nostrband/nostr-tools";

type headerType = {
  onLogin: (a: boolean) => void;
};

const Header: FC<headerType> = ({ onLogin }) => {
  const dispatch = useDispatch();
  const { setIsAuth, setTheme } = userSlice.actions;
  const state = useAppSelector((state) => state.userReducer);

  const getNpub = () => {
    try {
      const npub = state.user?.pubkey
        ? nip19.npubEncode(state.user?.pubkey)
        : "";
      return npub ? npub : "";
    } catch (e) {
      console.log(e);
    }
  };

  const userNpub = getNpub();

  const logoutBtn = () => {
    localStorage.removeItem("login");
    dispatch(setIsAuth(false));
  };

  const setDarkMode = () => {
    document.querySelector("body")?.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    dispatch(setTheme("dark"));
  };
  const setLightMode = () => {
    document.querySelector("body")?.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    dispatch(setTheme("light"));
  };

  const toggleTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setDarkMode();
    } else {
      setLightMode();
    }
  };

  return (
    <Navbar
      expand="lg"
      data-bs-theme={`${state.theme === "dark" ? "dark" : "light"}`}
    >
      <Link className="header-logo" to="/">
        <img
          alt="logo"
          src="https://nostr.band/android-chrome-192x192.png"
          className="logo-img"
        />
        Nostr.Band
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="#home">Stats</Nav.Link>
          <NavDropdown title="Top " id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">People</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Posts</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Images</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.4">Video</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.4">Audio</NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Products " id="basic-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Stats</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">API</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Relay</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.4">
              Relay Browser
            </NavDropdown.Item>
            <NavDropdown.Item href="#action/3.4">Embed widget</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.1">NIP-05 names</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.1">Spam filter</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.1">Trust rank</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.1">RSS feeds</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.1">Search bots</NavDropdown.Item>
            {!state.isAuth && (
              <Form.Check
                checked={state.theme === "dark" ? true : false}
                style={{ marginLeft: "16px", cursor: "pointer" }}
                type="switch"
                id="custom-switch"
                label="Dark mode"
                onChange={toggleTheme}
              />
            )}
          </NavDropdown>
          {/* {!state.isAuth ? (
            <NavDropdown title="About " id="basic-nav-dropdown">
              <Form.Check
                style={{ marginLeft: "16px", cursor: "pointer" }}
                type="switch"
                id="custom-switch"
                label="Dark mode"
              />
              <NavDropdown.Item href="#action/3.1">About</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.1">Terms</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.1">Privacy</NavDropdown.Item>
            </NavDropdown>
          ) : (
            <NavDropdown
              title={`${localStorage.getItem("login")!.slice(0, 8)}`}
            >
              <NavDropdown.Item href="#action/3.1">Profile</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.1">Home feed</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.1">Posts</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.1">Following</NavDropdown.Item>
              <Form.Check
                style={{ marginLeft: "16px", cursor: "pointer" }}
                type="switch"
                id="custom-switch"
                label="Dark mode"
              />
              <NavDropdown.Item onClick={logoutBtn}>Log Out</NavDropdown.Item>
            </NavDropdown>
          )} */}
          {!state.isAuth && (
            <Nav.Link onClick={() => onLogin(true)}>Login</Nav.Link>
          )}
        </Nav>
        {state.isAuth && (
          <Nav>
            <NavDropdown
              id="profile-drop-menu"
              title={
                <div className="profile-wrapper">
                  {state.user?.picture && (
                    <div className="profile-avatar">
                      <img src={state.user?.picture} />
                    </div>
                  )}{" "}
                  {state.user?.display_name
                    ? state.user?.display_name
                    : state.user?.name
                    ? state.user?.name
                    : ""}
                </div>
              }
            >
              <NavDropdown.Item href={`/${userNpub}`}>Profile</NavDropdown.Item>
              <NavDropdown.Item href={`/?q=following:${userNpub}&type=posts`}>
                Home feed
              </NavDropdown.Item>
              <NavDropdown.Item href={`/?q=by:${userNpub}&type=posts`}>
                Posts
              </NavDropdown.Item>
              <NavDropdown.Item
                href={`/?q=following:${userNpub}&type=profiles`}
              >
                Following
              </NavDropdown.Item>
              <Form.Check
                checked={state.theme === "dark" ? true : false}
                style={{ marginLeft: "16px", cursor: "pointer" }}
                type="switch"
                id="custom-switch"
                label="Dark mode"
                onChange={toggleTheme}
              />
              <NavDropdown.Item onClick={logoutBtn}>Log Out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
