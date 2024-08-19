import { Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { allRoutes } from "./routes";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactModal from "react-modal";
import { Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { useEffect, useLayoutEffect, useState } from "react";
import { toast } from "react-toastify";
import { userSlice } from "./store/reducers/UserSlice";
import { NostrProvider } from "nostr-react";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import Home from "./pages/Home/Home";
import { openNostrBand } from "./utils/helper";

const relayUrls = ["wss://relay.nostr.band"];

const App = () => {
  const [isModal, setIsModal] = useState<boolean>(false);
  const closeModal = (): void => setIsModal(false);
  const store = useAppSelector((store) => store.userReducer);
  const { ndk, ndkAll } = useAppSelector((store) => store.connectionReducer);
  const location = useLocation();
  const [isSpringAd, setIsSpringAd] = useState(false);
  const [searchParams] = useSearchParams();

  const dispatch = useAppDispatch();
  const { setIsAuth, setContacts, setLists, setLabels, setUser } =
    userSlice.actions;

  useLayoutEffect(() => {
    ndk.connect();
    ndkAll.connect();
    if (store.theme === "dark") {
      document.querySelector("body")?.setAttribute("data-theme", "dark");
    }

    const lastAdSeen = Number(localStorage.getItem("lastAdSeen")) || 0;
    if (Date.now() - lastAdSeen > 24 * 3600 * 1000) {
      setIsSpringAd(true);
    }
  }, []);

  const getUser = async (pubkey: string): Promise<void> => {
    //@ts-ignore
    const user = await ndk.fetchEvent({ kinds: [0], authors: [pubkey] });
    const userContent = user?.content ? JSON.parse(user.content) : {};
    dispatch(setUser(userContent));

    const contacts = Array.from(
      await ndk.fetchEvents({ kinds: [3], authors: [pubkey] })
    )[0];
    dispatch(setContacts(contacts));

    const lists = Array.from(
      await ndk.fetchEvents({
        //@ts-ignore
        kinds: [30000],
        authors: [localStorage.getItem("login")!],
      })
    );
    dispatch(setLists(lists));

    const labels = Array.from(
      await ndk.fetchEvents({
        //@ts-ignore
        kinds: [1985],
        authors: [localStorage.getItem("login")!],
      })
    );
    dispatch(setLabels(labels));
  };

  useEffect(() => {
    const pubkey = localStorage.getItem("login");
    if (pubkey) {
      getUser(pubkey);
    }
  }, [store.isAuth]);

  useEffect(() => {
    openNostrBand();
  }, [location.pathname, searchParams.get("trending")!]);

  const loginBtn = async (): Promise<void> => {
    if (window.nostr) {
      const pubkey = await window.nostr.getPublicKey();
      dispatch(setIsAuth(true));
      localStorage.setItem("login", pubkey);
      setIsModal(false);
    } else {
      toast.error("Browser extension not found!", { autoClose: 3000 });
      setIsModal(false);
    }
  };

  return (
    <NostrProvider relayUrls={relayUrls} debug={true}>
      <Container>
        <ReactModal
          isOpen={isModal}
          onAfterOpen={() => {
            document.body.style.overflow = "hidden";
          }}
          onAfterClose={() => {
            document.body.style.overflow = "auto";
          }}
          onRequestClose={closeModal}
          ariaHideApp={false}
          className="login-modal"
          style={{ overlay: { zIndex: 6, background: "rgba(0,0,0,.4)" } }}
        >
          <div className="modal-header">
            <h4>Login</h4>
            <Button
              variant="link"
              style={{ fontSize: "1.8rem", color: "black" }}
              onClick={closeModal}
            >
              <X color="var(--body-color)" />
            </Button>
          </div>
          <hr />
          <div className="modal-body">
            <div>
              <Button variant="outline-primary" onClick={loginBtn}>
                Login with browser extension
              </Button>
            </div>
            <p className="mt-2">
              Please login using Nostr browser extension. You can try{" "}
              <a href="https://getalby.com/" target="_blank">
                Alby
              </a>
              ,{" "}
              <a
                href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp"
                target="_blank"
              >
                nos2x
              </a>{" "}
              or{" "}
              <a
                href="https://testflight.apple.com/join/ouPWAQAV"
                target="_blank"
              >
                Nostore
              </a>{" "}
              (for Safari).
            </p>
          </div>
          <hr />
          <div className="modal-footer">
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
          </div>
        </ReactModal>
        <ToastContainer />
        <Row className="justify-content-lg-center">
          <Col lg={9}>
            <Header onLogin={loginBtn} />
            <Routes>
              {allRoutes.map((route) => {
                return route ? (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={<route.Component />}
                  />
                ) : (
                  <Route path={"/"} element={<Home />} />
                );
              })}
            </Routes>
            <Footer />
          </Col>
        </Row>
        <div
          id="spring-ad"
          className={`offcanvas offcanvas-bottom ${
            isSpringAd ? "show" : "hide"
          }`}
          tabIndex={-1}
          aria-labelledby="offcanvasBottomLabel"
          data-bs-scroll="true"
          data-bs-backdrop="false"
          aria-modal="true"
          role="dialog"
        >
          <div className="offcanvas-header" style={{ display: "block" }}>
            <div className="row justify-content-md-center">
              <div className="col col-lg-6 d-flex justify-content-between">
                <h5 className="offcanvas-title" id="offcanvasBottomLabel">
                  <img src="https://npub.pro/favicon.ico" width="30" />
                  <span style={{ verticalAlign: "middle" }}>
                    &nbsp;Nostr-based websites for creators!
                  </span>
                </h5>
                <button
                  onClick={() => {
                    setIsSpringAd(false);
                    localStorage.setItem("lastAdSeen", Date.now().toString());
                  }}
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>
            </div>
          </div>
          <div className="offcanvas-body" style={{ paddingTop: 0 }}>
            <div className="row justify-content-md-center">
              <div className="col col-lg-6 d-flex justify-content-between">
                <div className="row w-100">
                  <div className="col-12 col-lg-8 d-flex align-items-center pb-2">
                    Best way to share your content outside of Nostr!
                  </div>
                  <div className="col-12 col-lg-4 d-flex flex-row justify-content-start justify-content-lg-end">
                    {/* <a
                      id="spring-learn"
                      className="btn btn-outline-secondary me-1"
                      href="https://nsec.app"
                      target="_blank"
                    >
                      Learn more
                    </a> */}
                    <a
                      id="spring-download"
                      className="btn btn-outline-primary"
                      href="https://npub.pro"
                      target="_blank"
                    >
                      Try Npub.pro &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </NostrProvider>
  );
};

export default App;
