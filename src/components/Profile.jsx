import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Container, Tab, Tabs, Row, Col, Form, Button } from "react-bootstrap";

import { API_URL, JWT_KEY } from "../constants";
import { AppContext } from "../App";
import PostsGrid from "./PostsGrid";
import Avatar from "./Avatar";
import noAvatar from "../assets/noavatar.png";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 4;

export default function Post() {
  const context = useContext(AppContext);
  const currentUser = context.currentUser;
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState(currentUser.profileImage);

  const [currentPage, setCurrentPage] = useState(0);
  const [allItemsCount, setAllItemsCount] = useState(0);

  const getPosts = (pageNumber = 0) => {
    axios
      .get(`${API_URL}/usersPosts/${currentUser._id}`, {
        params: {
          itemsCount: ITEMS_PER_PAGE,
          itemsOffset: pageNumber * ITEMS_PER_PAGE,
        },
      })
      .then((res) => {
        if (res.data.success) {
          const posts = res.data.posts;
          setPosts(posts);
          setAllItemsCount(res.data.allItemsCount);
        }
      });
  };
  useEffect(() => {
    getPosts();
  }, []);

  const updateImage = (event) => {
    const files = [...event.target.files]
      .filter((file) => ["image/jpeg", "image/png"].includes(file.type))
      .slice(0, 1);
    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          //initializez cititorul de fisiere
          const reader = new FileReader();

          //event.target.result = poza in baza 64
          reader.onload = (event) => {
            resolve(event.target.result);
          };

          //citeste fisierul declanseaza 'onload'
          reader.readAsDataURL(file);
        });
      })
    ).then((srcArr) => {
      setImage(srcArr);
    });
  };
  const onAddProfileImage = (event) => {
    event.preventDefault();

    const userJwt = localStorage.getItem(JWT_KEY);
    if (userJwt) {
      axios
        .post(
          `${API_URL}/profileImage`,
          {
            image: image,
          },
          {
            headers: { Authorization: `Bearer ${userJwt}` },
          }
        )
        .then((res) => {
          if (res.data.success) {
            //window.location.replace("/");
          }
        });
    }
  };

  const gotoPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    getPosts(pageNumber);
  };

  return (
    <Container>
      <h3>Profilul meu</h3>
      <Row className="profile-details mb-3 align-items-center">
        <Col xs="auto">
          <Avatar src={currentUser.profileImage} size="80" className="mr-3" />
        </Col>
        <Col>
          <Row style={{ gap: "20px" }}>
            <Col xs="auto">
              <dt>Nume</dt>
              <dd>{currentUser.name}</dd>
            </Col>

            <Col xs="auto">
              <dt>E-mail</dt>
              <dd>{currentUser.email}</dd>
            </Col>

            <Col xs="auto">
              <dt>Rol</dt>
              <dd>{currentUser.role.name}</dd>
            </Col>

            <Col xs="auto">
              <dt>Înscris la</dt>
              <dd>
                {new Date(currentUser.date).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </Col>

            <Col xs="auto">
              <dt>Anunțuri</dt>
              <dd>{posts.length}</dd>
            </Col>
          </Row>
        </Col>
      </Row>
      <Tabs defaultActiveKey="changePicture" className="mb-3" fill>
        <Tab eventKey="changePicture" title="Modifică avatarul">
          <div>
            <Form onSubmit={onAddProfileImage}>
              <img
                src={image || noAvatar}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                className="border rounded mb-3"
              />
              <Form.Control
                type="file"
                name="images"
                accept="image/png, image/jpeg"
                onChange={updateImage}
                className="mb-3"
              ></Form.Control>
              <Button type="submit">Schimbă imaginea</Button>
            </Form>
          </div>
        </Tab>
        <Tab eventKey="posts" title="Anunțurile tale">
          <PostsGrid posts={posts}></PostsGrid>
          <Pagination
            className="mt-3"
            currentPage={currentPage}
            pagesCount={Math.ceil(allItemsCount / ITEMS_PER_PAGE)}
            gotoPage={gotoPage}
          />
        </Tab>
      </Tabs>
    </Container>
  );
}
