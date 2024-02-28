import { useEffect, useState, useContext } from "react";
import { AppContext } from "../App";

import {
  Container,
  Button,
  Row,
  Form,
  ListGroup,
  Alert,
} from "react-bootstrap";

import Avatar from "./Avatar";
import TimeAgo from "react-timeago";
import roStrings from "react-timeago/lib/language-strings/ro";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

import { JWT_KEY } from "../constants";
import { Link } from "react-router-dom";

const formatter = buildFormatter(roStrings);

function ConversationChat(props) {
  const context = useContext(AppContext);
  const socket = context.socket;
  const currentUser = context.currentUser;

  const userJwt = localStorage.getItem(JWT_KEY);

  const [messages, setMessages] = useState([]);
  const [errors, setErrors] = useState([]);

  const getMessages = () => {
    socket.emit("get messages", userJwt, props.conversationId, (res) => {
      if (res.success) {
        setMessages(res.messages);
      }
    });
  };

  useEffect(() => {
    getMessages();
    socket.on(`new conversation message ${props.conversationId}`, (message) => {
      setMessages((messages) => [...messages, message]);
    });
    return () => {
      socket.off(`new conversation message ${props.conversationId}`);
    };
  }, [props.conversationId]);

  const showErrors = () => {
    if (!errors.length) {
      return null;
    }
    return (
      <div className="mt-3">
        {errors.map((error, index) => (
          <Alert key={index} variant="danger">
            {error}
          </Alert>
        ))}
      </div>
    );
  };

  const sendMessage = (event) => {
    event.preventDefault();
    setErrors([]);
    socket.emit(
      "send conversation message",
      props.conversationId,
      event.target.newMessage.value,
      userJwt,
      (res) => {
        if (!res.success) {
          setErrors(res.errors);
        }
      }
    );
    event.target.newMessage.value = "";
  };

  if (!props.conversationId || !props.conversation) {
    return <Container>Nu ai nicio conversație activă</Container>;
  }

  const otherUser =
    props.conversation.postAuthor._id === currentUser._id
      ? props.conversation.user
      : props.conversation.postAuthor;

  return (
    <Container
      className="d-flex flex-column"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div className="d-flex bg-light border border-1 border-muted rounded mb-3 align-items-center p-3">
        <Avatar
          src={props.conversation.post.images[0]}
          className="flex-shrink-0 me-2 p-0"
        />
        <Row xs={1}>
          <Link to={`/post/${props.conversation.post._id}`}>
            <strong>{props.conversation.post.petName}</strong>
          </Link>
          <small>{otherUser.name}</small>
        </Row>
      </div>
      <ListGroup className="overflow-auto flex-fill mb-3">
        {messages.map((message) => (
          <ListGroup.Item key={message._id}>
            <div className="d-flex align-items-center mb-2">
              <Avatar
                src={message.author.profileImage}
                size="30"
                className="me-2"
              />
              <div className="d-flex flex-column">
                <strong>{message.author.name}</strong>
                <small className="text-muted">
                  <TimeAgo date={message.date} formatter={formatter} />
                </small>
              </div>
            </div>
            {message.content}
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Form onSubmit={sendMessage}>
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            name="newMessage"
            placeholder="Trimite un mesaj"
            className="me-2"
          ></Form.Control>

          <Button type="submit" className="text-nowrap">Trimite<FontAwesomeIcon icon={faPaperPlane} className="ms-2" /></Button>
        </div>
      </Form>
      {showErrors()}
    </Container>
  );
}

export default ConversationChat;
