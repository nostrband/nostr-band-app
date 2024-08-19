import "./Header.css";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userSlice } from "../../store/reducers/UserSlice";
import { FC, useCallback, useEffect } from "react";
import { useAppSelector } from "../../hooks/redux";
import { nip19 } from "@nostrband/nostr-tools";
import { formatDate } from "../../utils/formatDate";

type headerType = {
  onLogin: (a: boolean) => void;
};

const Header: FC<headerType> = ({ onLogin }) => {
  const dispatch = useDispatch();
  const { setIsAuth, setTheme } = userSlice.actions;
  const state = useAppSelector((state) => state.userReducer);
  const today = new Date();
  const loginPk = localStorage.getItem("login");

  const getNpub = () => {
    try {
      const npub = loginPk ? nip19.npubEncode(loginPk) : "";
      return npub ? npub : "";
    } catch (e) {
      console.log(e);
    }
  };

  const userNpub = getNpub();

  const logout = useCallback(() => {
    localStorage.removeItem("login");
    dispatch(setIsAuth(false));
  }, [dispatch, setIsAuth]);

  const handleLogout = () => {
    logout();
    document.dispatchEvent(new Event("nlLogout"))
  }

  useEffect(() => {
    document.addEventListener('nlAuth', (e: any) => {
      if (e.detail.type === 'login' || e.detail.type === 'signup') {
        onLogin(true);
      } else {
        logout()
      }
    })    
  }, [logout, onLogin])

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

  const onLoginClick = () => {
    onLogin(true);
  }

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
          <Nav.Link href="https://stats.nostr.band">Stats</Nav.Link>
          <NavDropdown title="Top " id="basic-nav-dropdown">
            <NavDropdown.Item>
              <Link to={`/trending/profiles/${formatDate(today)}`}>People</Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Link to={`/trending/notes/${formatDate(today)}`}>Posts</Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Link to={`/trending/images/${formatDate(today)}`}>Images</Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Link to={`/trending/videos/${formatDate(today)}`}>Video</Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Link to={`/trending/audios/${formatDate(today)}`}>Audio</Link>
            </NavDropdown.Item>
          </NavDropdown>
          <NavDropdown title="Products " id="basic-nav-dropdown">
            <NavDropdown.Item href="https://stats.nostr.band/">
              Stats
            </NavDropdown.Item>
            <NavDropdown.Item href="https://api.nostr.band">
              API
            </NavDropdown.Item>
            <NavDropdown.Item href="https://relay.nostr.band/index.html">
              Relay
            </NavDropdown.Item>
            <NavDropdown.Item href="https://embed.nostr.band">
              Embed widget
            </NavDropdown.Item>
            <NavDropdown.Item href="https://spam.nostr.band">
              Spam filter
            </NavDropdown.Item>
            <NavDropdown.Item href="https://trust.nostr.band">
              Trust rank
            </NavDropdown.Item>
            <NavDropdown.Item href="https://zapper.fun/">
              Zapper.fun
            </NavDropdown.Item>
            <NavDropdown.Item href="https://nsec.app/">
              Nsec.app
            </NavDropdown.Item>
            <NavDropdown.Item href="https://npub.pro/">
              Npub.pro
            </NavDropdown.Item>
          </NavDropdown>
          {
            !state.isAuth && (
              <NavDropdown title="About " id="basic-nav-dropdown">
                <NavDropdown.Item href="/about.html">About</NavDropdown.Item>
                <NavDropdown.Item href="/tos.html">Terms</NavDropdown.Item>
                <NavDropdown.Item href="/privacy.html">
                  Privacy
                </NavDropdown.Item>
                <Form.Check
                  checked={state.theme === "dark" ? true : false}
                  style={{ marginLeft: "16px", cursor: "pointer" }}
                  type="switch"
                  id="custom-switch"
                  label="Dark mode"
                  onChange={toggleTheme}
                />
              </NavDropdown>
            )
            /* : (
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
          )} */
          }
          {!state.isAuth && (
            <Nav.Link onClick={onLoginClick}>Login</Nav.Link>
          )}
        </Nav>
        {state.isAuth && state.user && (
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
              <NavDropdown.Item onClick={handleLogout}>Log Out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
