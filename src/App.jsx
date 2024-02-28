import { useEffect, useState, createContext } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import io from "socket.io-client";

import {
  Navbar,
  Nav,
  Container,
  Button,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { LinkContainer } from "react-router-bootstrap";

import Register from "./components/Register";
import Login from "./components/Login";
import { JWT_KEY, API_URL } from "./constants";
import AddPost from "./components/AddPost";
import AllUsers from "./components/AllUsers";
import AllPosts from "./components/AllPosts";
import Post from "./components/Post";
import Profile from "./components/Profile";
import Logo from "./components/Logo";

import Conversation from "./components/Conversation";
import Statistics from "./components/Statistics";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import "./custom.scss";
import Avatar from "./components/Avatar";

import footerIllustration from "./assets/footerIllustration.svg";

export const AppContext = createContext();

const socket = io.connect(API_URL);

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const userJwt = localStorage.getItem(JWT_KEY);

  useEffect(() => {
    if (userJwt) {
      axios
        .get(`${API_URL}/currentUser`, {
          headers: { Authorization: `Bearer ${userJwt}` },
        })
        .then((res) => {
          if (res.data.success) {
            setCurrentUser(res.data.user);
          } else {
            localStorage.removeItem(JWT_KEY);
          }
          setLoading(false);
          console.log(res.data);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem(JWT_KEY);
    window.location.replace("/");
  };

  const showRoutes = () => {
    return (
      <>
        <Routes>
          <Route
            path="/"
            element={
              <Container className="d-flex flex-column">
                <AllPosts></AllPosts>
              </Container>
            }
          ></Route>
          <Route path={`/post/:postId`} element={<Post></Post>}></Route>
          {currentUser ? (
            <>
              {currentUser.role.isAdmin && (
                <>
                  <Route
                    path="/editUsers"
                    element={<AllUsers></AllUsers>}
                  ></Route>
                  <Route
                    path="/statistics"
                    element={<Statistics></Statistics>}
                  ></Route>
                </>
              )}

              <Route
                path="/conversations"
                element={<Conversation></Conversation>}
              ></Route>
              <Route
                path="/conversations/:conversationId"
                element={<Conversation></Conversation>}
              ></Route>

              <Route
                path="/createPost"
                element={<AddPost key="create"></AddPost>}
              ></Route>
              <Route path="/profile" element={<Profile></Profile>}></Route>
              <Route
                path={`/post/:postId/edit`}
                element={<AddPost edit={true}></AddPost>}
              ></Route>
            </>
          ) : (
            <>
              <Route path="/login" element={<Login></Login>}></Route>
              <Route path="/register" element={<Register></Register>}></Route>
            </>
          )}
          <Route
            path="*"
            element={
              <div className="d-flex align-items-center justify-content-center flex-column w-100">
                <h1 className="text-primary" style={{ fontSize: "10em" }}>
                  404
                </h1>
                <p>Pagina nu a fost găsită</p>
              </div>
            }
          ></Route>
        </Routes>
      </>
    );
  };

  if (loading) {
    return (
      <div className="d-flex flex-fill align-items-center justify-content-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        currentUser: currentUser,
        socket: socket,
      }}
    >
      <Router>
        <Navbar variant="light" bg="light" expand="lg" className="header">
          <Container fluid="lg">
            <LinkContainer to="/">
              <Navbar.Brand className="logo-wrapper">
                <Logo size={60} />
                <span className="text-dark">Puppyland</span>
              </Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="nav-menu" />
            <Navbar.Collapse id="nav-menu" className="justify-content-end">
              <Nav className="align-items-center">
                <LinkContainer to="/">
                  <Nav.Link>Toate anunțurile</Nav.Link>
                </LinkContainer>
                {currentUser ? (
                  <>
                    {currentUser.role.isAdmin && (
                      <>
                        <LinkContainer to="/editUsers">
                          <Nav.Link>Editează utilizatori</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/statistics">
                          <Nav.Link>Statistici</Nav.Link>
                        </LinkContainer>
                      </>
                    )}

                    <LinkContainer to="/conversations">
                      <Nav.Link>Conversații</Nav.Link>
                    </LinkContainer>

                    <Link to="/createPost">
                      <Button
                        variant="primary"
                        className="text-white fw-semibold"
                      >
                        <FontAwesomeIcon icon={faPlus} /> Anunț nou
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline-secondary">
                        <FontAwesomeIcon
                          icon={faArrowRightToBracket}
                          className="me-2"
                        />{" "}
                        Intră în cont
                      </Button>
                    </Link>
                    &nbsp;
                    <Link to="/register">
                      <Button variant="primary">Înregistrează-te</Button>
                    </Link>
                  </>
                )}
                {currentUser && (
                  <div className="profile-wrapper">
                    <LinkContainer to="/profile">
                      <Nav.Link className="fw-bold">
                        <Avatar src={currentUser.profileImage} />
                        {currentUser?.name}
                      </Nav.Link>
                    </LinkContainer>
                    <Button
                      onClick={onLogout}
                      variant="outline-secondary"
                      className="align-self-center"
                    >
                      <FontAwesomeIcon
                        icon={faArrowRightFromBracket}
                        className="me-2"
                      />
                      Logout
                    </Button>
                  </div>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Container fluid="lg" className="d-flex flex-fill main-container">
          {!loading && showRoutes()}
        </Container>
        <footer className="text-light">
          <Container fluid="lg" className="d-flex">
            <Row className="w-100 align-items-center" xs={1} md={2}>
              <Col className="flex-fill d-flex flex-column">
                <strong>Puppyland 2022</strong>
                <small className="text-muted mb-3">
                  Găsește-ți cel mai bun prieten
                </small>
                <Row className="w-auto" xs={3}>
                  <a href="#" className="w-auto">
                    <FontAwesomeIcon icon={faInstagram} size={"lg"} />
                  </a>
                  <a href="#" className="w-auto">
                    <FontAwesomeIcon icon={faTwitter} size={"lg"} />
                  </a>
                  <a href="#" className="w-auto">
                    <FontAwesomeIcon icon={faFacebook} size={"lg"} />
                  </a>
                </Row>
              </Col>
              <Col className="d-flex justify-content-end">
                <img
                  src={footerIllustration}
                  height="170"
                  style={{ maxWidth: "calc(100% - 30px)" }}
                  alt="cățeluși"
                />
              </Col>
            </Row>
          </Container>
        </footer>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
