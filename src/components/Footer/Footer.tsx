import { Button } from "react-bootstrap";
import "./Footer.css";
import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__links">
        <Button variant="link">About</Button>
        <Button variant="link">Privacy</Button>
        <Button variant="link">Terms</Button>
      </div>
      <p>@ 2023</p>
    </footer>
  );
};

export default Footer;
