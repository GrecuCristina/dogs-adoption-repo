import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Carousel,
  ListGroup,
  Row,
  Col,
  Button,
  ButtonGroup,
  Badge,
  Tabs,
  Tab,
  Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faTrashArrowUp,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";

import { API_URL, JWT_KEY } from "../constants";
import { AppContext } from "../App";
import Avatar from "./Avatar";

import dislikeImage from "../assets/dislike.svg";
import likeImage from "../assets/like.svg";
import loveImage from "../assets/love.svg";

export default function Post() {
  const [post, setPost] = useState();
  const [reactions, setReactions] = useState([]);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);

  const { postId } = useParams();
  const navigate = useNavigate();

  const context = useContext(AppContext);
  const currentUser = context.currentUser;
  const userJwt = localStorage.getItem(JWT_KEY);

  const getReactions = () => {
    axios.get(`${API_URL}/reactions/${postId}`).then((res) => {
      if (res.data.success) {
        setReactions(res.data.reactions);
      }
    });
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/post/${postId}`, {
        headers: { Authorization: `Bearer ${userJwt || ""}` },
      })
      .then((res) => {
        if (res.data.success) {
          const post = res.data.post;
          setPost(post);
        }
      });

    getReactions();
  }, []);

  const archivePost = (archiveValue) => {
    if (userJwt) {
      axios
        .put(
          `${API_URL}/archivePost/${postId}`,
          {
            archiveValue: archiveValue,
          },
          {
            headers: { Authorization: `Bearer ${userJwt}` },
          }
        )
        .then((res) => {
          if (res.data.success) {
            navigate("/");
          }
        });
    }
  };

  const editPost = () => {
    navigate(`/post/${postId}/edit`);
  };
  if (!post) {
    return null;
  }
  const setReaction = (reactionType) => {
    const userJwt = localStorage.getItem(JWT_KEY);

    if (userJwt) {
      axios
        .post(
          `${API_URL}/reaction/${post._id}`,
          {
            reactionType: reactionType,
          },
          {
            headers: { Authorization: `Bearer ${userJwt}` },
          }
        )
        .then((res) => {
          if (res.data.success) {
            getReactions();
          }
        });
    }
  };
  let yourReaction;
  if (currentUser) {
    yourReaction = reactions.find(
      (reaction) => reaction.user._id === currentUser._id
    );
  }

  const getReactionListByType = (reactionType) => {
    const reactionsByType = reactions.filter(
      (reaction) => reaction.type === reactionType
    );

    if (!reactionsByType.length) {
      return (
        <ListGroup>
          <ListGroup.Item className="text-muted">
            Nu este nicio reacție de acest tip
          </ListGroup.Item>
        </ListGroup>
      );
    }

    return (
      <ListGroup>
        {reactionsByType.slice(0, 5).map((reaction) => (
          <ListGroup.Item
            className="d-flex align-items-center"
            key={reaction._id}
          >
            <Avatar src={reaction.user.profileImage} className="me-2" />{" "}
            <strong>{reaction.user.name}</strong>
            <Badge bg="secondary" className="ms-auto">
              {new Date(reaction.date).toLocaleDateString("ro-RO", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Badge>
          </ListGroup.Item>
        ))}
        {reactionsByType.length > 5 && (
          <ListGroup.Item>
            Și alte {reactionsByType.length - 5} persoane
          </ListGroup.Item>
        )}
      </ListGroup>
    );
  };

  const goToPostConversation = () => {
    axios
      .get(`${API_URL}/conversation/${postId}`, {
        headers: { Authorization: `Bearer ${userJwt}` },
      })
      .then((res) => {
        if (res.data.success) {
          navigate(`/conversations/${res.data.conversationId}`);
        }
      });
  };
  return (
    <Container>
      <h3 className="mb-3">
        {post.petName}{" "}
        {post.breed && <small className="text-muted">{post.breed?.name}</small>}
      </h3>
      <Row xs="1" md="1" lg="2">
        <Col className="mb-3" lg={5} xl={4}>
          <Row>
            <ListGroup className="m-0 mb-3">
              <ListGroup.Item>
                <div className="fw-bold">Nume</div>
                {post.petName}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold">Rasă</div>
                {post.breed?.name || "Necunoscută"}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold">Vârstă</div>
                {post.age} ani
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold">Sex</div>
                {post.gender === "male" ? `Mascul` : `Femelă`}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold">Județ</div>
                {post.county?.name}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold">A fost adoptat</div>
                {post.wasAdopted ? "Da" : "Nu"}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold">Postat de</div>
                <Avatar src={post.author.profileImage} size={25} />{" "}
                {post.author.name}
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="fw-bold">Postat la</div>
                {new Date(post.date).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </ListGroup.Item>
            </ListGroup>
          </Row>
          <Button
            variant="light"
            className="mb-3 d-flex align-items-center w-100 border border-1 border-muted"
            onClick={() => setShowReactionsModal(true)}
          >
            <div className="d-flex align-items-center reactions-small-group me-2">
              <div className={"reaction-image border border-2 border-primary"}>
                <img src={dislikeImage} alt="Nu îmi place" />
              </div>
              <div className={"reaction-image border border-2 border-primary"}>
                <img src={likeImage} alt="Îmi place" />
              </div>
              <div className={"reaction-image border border-2 border-primary"}>
                <img src={loveImage} alt="Ador" />
              </div>
            </div>
            {reactions.length} reacții
          </Button>
          <Row>
            <Row xs={1} md={1} className="g-1">
              <Button
                variant={yourReaction?.type === "love" ? "primary" : "light"}
                onClick={() => {
                  setReaction("love");
                }}
                className="d-flex align-items-center"
                disabled={!currentUser}
              >
                <div
                  className={
                    "reaction-image border border-2 border-primary me-2"
                  }
                >
                  <img src={loveImage} alt="Ador" />
                </div>
                Ador
                <Badge
                  bg="light"
                  text="dark"
                  pill
                  className="ms-auto border border-1 border-primary"
                >
                  {
                    reactions.filter((reaction) => reaction.type === "love")
                      .length
                  }{" "}
                  reacții
                </Badge>
              </Button>
              <Button
                variant={yourReaction?.type === "like" ? "primary" : "light"}
                onClick={() => {
                  setReaction("like");
                }}
                className="d-flex align-items-center"
                disabled={!currentUser}
              >
                <div
                  className={
                    "reaction-image border border-2 border-primary me-2"
                  }
                >
                  <img src={likeImage} alt="Îmi place" />
                </div>
                Îmi place
                <Badge
                  bg="light"
                  text="dark"
                  pill
                  className="ms-auto border border-1 border-primary"
                >
                  {
                    reactions.filter((reaction) => reaction.type === "like")
                      .length
                  }{" "}
                  reacții
                </Badge>
              </Button>

              <Button
                variant={yourReaction?.type === "dislike" ? "primary" : "light"}
                onClick={() => {
                  setReaction("dislike");
                }}
                className="d-flex align-items-center"
                disabled={!currentUser}
              >
                <div
                  className={
                    "reaction-image border border-2 border-primary me-2"
                  }
                >
                  <img src={dislikeImage} alt="Nu îmi place" />
                </div>
                Nu îmi place
                <Badge
                  bg="light"
                  text="dark"
                  pill
                  className="ms-auto border border-1 border-primary"
                >
                  {
                    reactions.filter((reaction) => reaction.type === "dislike")
                      .length
                  }{" "}
                  reacții
                </Badge>
              </Button>
            </Row>
            {currentUser && currentUser._id !== post.author._id && (
              <Button
                className="mt-3 p-3 text-white"
                onClick={() => goToPostConversation()}
              >
                Contactează autorul
                <FontAwesomeIcon icon={faMessage} className="ms-2" />
              </Button>
            )}
          </Row>
        </Col>
        <Col className="mb-3 flex-fill">
          <Carousel variant="dark" className="post-carousel mb-3">
            {post.images.map((image, imageIndex) => (
              <Carousel.Item key={imageIndex}>
                <img
                  src={image}
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    maxHeight: "70vh",
                  }}
                  className="d-flex w-100 align-self-start"
                />
              </Carousel.Item>
            ))}
          </Carousel>
          <Row className="mb-3">
            <div className="fw-bold">Descriere</div>
            <p className="lead text-break">{post.description}</p>
          </Row>
        </Col>
      </Row>

      {currentUser?._id === post.author._id || currentUser?.role.isAdmin ? (
        <ButtonGroup>
          <Button variant="outline-secondary" onClick={editPost}>
            <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
            Editează anunțul
          </Button>
          {!post.isArchived && (
            <Button
              variant="outline-danger"
              onClick={() => setShowDeleteConfirmationModal(true)}
            >
              <FontAwesomeIcon icon={faTrash} className="me-2" />
              {currentUser?.role.isAdmin
                ? `Arhivează anunțul`
                : `Șterge anunțul`}
            </Button>
          )}
          {post.isArchived && currentUser?.role.isAdmin && (
            <Button variant="outline-danger" onClick={() => archivePost(false)}>
              <FontAwesomeIcon icon={faTrashArrowUp} className="me-2" />
              Dezarhivează anunțul
            </Button>
          )}
        </ButtonGroup>
      ) : null}

      <Modal
        show={showReactionsModal}
        onHide={() => setShowReactionsModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>{reactions.length} reacții</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs defaultActiveKey={"likes"} fill className="mb-3">
            <Tab eventKey="dislikes" title="Nu îmi place">
              {getReactionListByType("dislike")}
            </Tab>
            <Tab eventKey="likes" title="Îmi place">
              {getReactionListByType("like")}
            </Tab>
            <Tab eventKey="loves" title="Ador">
              {getReactionListByType("love")}
            </Tab>
          </Tabs>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteConfirmationModal}
        onHide={() => setShowDeleteConfirmationModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmă ștergerea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ești sigur că vrei să ștergi acest anunț? Această acțiune este
          ireversibilă.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirmationModal(false)}
          >
            Anulează
          </Button>
          <Button variant="primary" onClick={() => archivePost(true)}>
            {currentUser?.role.isAdmin ? `Da, arhivează` : `Da, șterge`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
