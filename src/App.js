import { Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { allRoutes } from "./routes";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Container>
      <ToastContainer />
      <Row className="justify-content-lg-center">
        <Col lg={9}>
          <Header />
          <Routes>
            {allRoutes.map((route) => {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.Component />}
                />
              );
            })}
          </Routes>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
