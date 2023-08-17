import "./Header.css";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userSlice } from "../../src/store/reducers/UserSlice";

const Header = ({ onLogin }) => {
  const dispatch = useDispatch();
  const { setIsAuth } = userSlice.actions;
  const state = useSelector((state) => state.userReducer);

  const logoutBtn = () => {
    localStorage.removeItem("login");
    dispatch(setIsAuth(false));
  };

  return (
    <Navbar expand="lg">
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
          </NavDropdown>
          {!state.isAuth ? (
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
            <NavDropdown title={`${localStorage.getItem("login").slice(0, 8)}`}>
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
          )}
          {!state.isAuth && (
            <Nav.Link onClick={() => onLogin(true)}>Login</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
