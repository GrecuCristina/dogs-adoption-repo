import { useEffect, useState, useContext } from "react";
import { AppContext } from "../App";
import ConversationChat from "./ConversationChat";

import { Container, Row, Col, ListGroup, Badge } from "react-bootstrap";
import TimeAgo from "react-timeago";

import Avatar from "./Avatar";

import { JWT_KEY } from "../constants";
import { useParams, Link } from "react-router-dom";

function Conversation() {
  const context = useContext(AppContext);
  const socket = context.socket;
  const currentUser = context.currentUser;

  const [conversations, setConversations] = useState([]);

  const userJwt = localStorage.getItem(JWT_KEY);
  const { conversationId } = useParams();

  const getConversations = () => {
    socket.emit("get conversations", userJwt, (res) => {
      if (res.success) {
        setConversations(res.conversations);
      }
    });
  };
  useEffect(() => {
    socket.on(`conversations updated ${currentUser._id}`, () => {
      getConversations();
    });
    getConversations();

    //se apeleaza la unmount(demontarea) componentei
    return () => {
      socket.off(`conversations updated ${currentUser._id}`);
    };
  }, []);

  if (!conversations.length) {
    return (
      <Container className="d-flex flex-column">
        <h3>Nu ai încă nicio conversație</h3>
      </Container>
    );
  }

  return (
    <Container
      fluid="lg"
      className="d-flex flex-column flex-fill position-relative"
    >
      <Row className="mb-3">
        <h5>Conversațiile tale</h5>
      </Row>
      <Row xs={1} md={2} className="g-2 flex-fill position-relative">
        <Col
          md={4}
          className="h-100 overflow-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <ListGroup>
            {conversations.map((conversation) => {
              const otherUser =
                conversation.postAuthor._id === currentUser._id
                  ? conversation.user
                  : conversation.postAuthor;
              return (
                <Link
                  to={`/conversations/${conversation._id}`}
                  key={conversation._id}
                  className="text-reset text-decoration-none"
                >
                  <ListGroup.Item
                    active={conversation._id === conversationId}
                    className="d-flex align-items-center"
                  >
                    <Avatar
                      src={conversation.post.images[0]}
                      className="me-2 flex-shrink-0"
                    />
                    <Row xs={2} className="align-items-center flex-fill">
                      <Row xs={1} className="flex-fill">
                        <strong className="text-truncate">
                          {conversation.post.petName}
                        </strong>
                        <small className="text-truncate">
                          {otherUser.name}
                        </small>
                      </Row>
                      <Badge className="w-auto ms-auto border border-2 border-white">
                        <TimeAgo
                          date={new Date(conversation.lastUpdate)}
                          live={true}
                          formatter={(
                            value,
                            unit,
                            suffix,
                            epochMilliseconds
                          ) => {
                            console.log(value, unit, suffix);
                            if (
                              suffix === "from now" ||
                              (value < 10 && unit === "second")
                            ) {
                              return "acum";
                            }
                            if (
                              unit === "week" ||
                              unit === "month" ||
                              unit === "year"
                            ) {
                              return new Date(
                                epochMilliseconds
                              ).toLocaleDateString("ro-RO");
                            }
                            let newUnit = "";
                            switch (unit) {
                              case "second":
                                newUnit = "sec";
                                break;
                              case "minute":
                                newUnit = "min";
                                break;
                              case "hour":
                                newUnit = "h";
                                break;
                              case "day":
                                newUnit = "z";
                                break;
                            }
                            return `${value} ${newUnit}`;
                          }}
                        />
                      </Badge>
                    </Row>
                  </ListGroup.Item>
                </Link>
              );
            })}
          </ListGroup>
        </Col>
        <Col className="flex-fill">
          <ConversationChat
            conversation={conversations.find(
              (conversation) => conversation._id === conversationId
            )}
            conversationId={conversationId}
          ></ConversationChat>
        </Col>
      </Row>
    </Container>
  );
}

export default Conversation;
