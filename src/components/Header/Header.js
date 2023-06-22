import "./Header.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Form from "react-bootstrap/Form";
import { Col, Row } from "react-bootstrap";

const Header = () => {
  return (
    <Container>
      <Row className="justify-content-lg-center">
        <Col lg={9}>
          <Navbar expand="lg">
            <Navbar.Brand href="#home" className="header-logo">
              <img
                src="https://nostr.band/android-chrome-192x192.png"
                className="logo-img"
              />
              Nostr.Band
            </Navbar.Brand>
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
                  <NavDropdown.Item href="#action/3.4">
                    Embed widget
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.1">
                    NIP-05 names
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.1">
                    Spam filter
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.1">
                    Trust rank
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.1">
                    RSS feeds
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.1">
                    Search bots
                  </NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="About " id="basic-nav-dropdown">
                  <Form.Check
                    style={{ marginLeft: "16px", cursor: "pointer" }}
                    type="switch"
                    id="custom-switch"
                    label="Dark mode"
                  />
                  <NavDropdown.Item href="#action/3.1">About</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.1">Terms</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.1">
                    Privacy
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="#home">Login</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
