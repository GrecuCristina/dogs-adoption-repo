import React, { useContext } from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useAutoAnimate } from "@formkit/auto-animate/react";

import { Link } from "react-router-dom";
import { AppContext } from "../App";
export default function PostsGrid(props) {
  const [animationParent] = useAutoAnimate();
  const context = useContext(AppContext);
  const currentUser = context.currentUser;

  return (
    <Container className="flex-fill">
      <Row xs={1} md={2} xl={3} xxl={4} className="g-4" ref={animationParent}>
        {props.posts.map((post) => (
          <Col key={post._id}>
            <Link
              to={`/post/${post._id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Card>
                <Card.Img
                  variant="top"
                  src={post.images[0]}
                  className="flex-fill"
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />

                {post.wasAdopted && (
                  <Badge
                    bg="primary"
                    style={{ position: "absolute", right: "10px", top: "10px" }}
                  >
                    Adoptat
                  </Badge>
                )}
                {currentUser?.role.isAdmin && (
                  <div
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "10px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {post.isArchived && <Badge bg="danger">Arhivat</Badge>}
                    {!post.isAuthorActive && (
                      <Badge bg="danger">Autor inactiv</Badge>
                    )}
                  </div>
                )}
                <Card.Body>
                  <Card.Title className="fw-semibold text-truncate">
                    <small>{post.petName}</small>
                  </Card.Title>
                  <Card.Subtitle className="text-muted text-truncate">
                    <small>{post.breed?.name || "Rasă necunoscută"}</small>
                  </Card.Subtitle>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
