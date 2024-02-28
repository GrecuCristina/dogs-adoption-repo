import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../App";
import { API_URL, JWT_KEY } from "../constants";
import noAvatar from "../assets/noavatar.png";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 6;

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [animationParent] = useAutoAnimate();
  const [searchedValue, setSearchedValue] = useState("");
  const context = useContext(AppContext);
  const currentUser = context.currentUser;

  const userJwt = localStorage.getItem(JWT_KEY);

  const [currentPage, setCurrentPage] = useState(0);
  const [allItemsCount, setAllItemsCount] = useState(0);

  const getUsers = (pageNumber = 0) => {
    axios
      .get(`${API_URL}/admin/users`, {
        params: {
          username: searchedValue,
          itemsCount: ITEMS_PER_PAGE,
          itemsOffset: pageNumber * ITEMS_PER_PAGE,
        },
        headers: { Authorization: `Bearer ${userJwt}` },
      })
      .then((res) => {
        if (res.data.success) {
          setUsers(res.data.users);
          setAllItemsCount(res.data.allItemsCount);
        }
      });
  };
  useEffect(() => {
    getUsers();

    axios
      .get(`${API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${userJwt}` },
      })
      .then((res) => {
        res.data.success && setRoles(res.data.roles);
      });
  }, []);

  const editRole = (userId, roleId) => {
    axios
      .put(
        `${API_URL}/editUser/${userId}/role`,
        {
          roleId: roleId,
        },
        {
          headers: { Authorization: `Bearer ${userJwt}` },
        }
      )
      .then((res) => {
        if (res.data.success) {
          getUsers();
        }
      });
  };
  const searchUsers = (event) => {
    event.preventDefault();
    setCurrentPage(0);
    getUsers();
  };
  const setActivateUser = (userId, activateUser) => {
    axios
      .put(
        `${API_URL}/setActivateUser/${userId}`,
        {
          //info in body...
          activateUser: activateUser,
        },
        {
          headers: { Authorization: `Bearer ${userJwt}` },
        }
      )
      .then((res) => {
        if (res.data.success) {
          getUsers();
        }
      });
  };
  const deleteUser = (userId) => {
    axios
      .delete(
        `${API_URL}/deleteUser/${userId}`,

        {
          headers: { Authorization: `Bearer ${userJwt}` },
        }
      )
      .then((res) => {
        if (res.data.success) {
          getUsers();
        }
      });
  };
  const gotoPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    getUsers(pageNumber);
  };

  return (
    <Container className="d-flex flex-column">
      <Form className="d-flex mb-3" onSubmit={searchUsers}>
        <Form.Control
          type="search"
          placeholder="Caută un utilizator"
          name="username"
          className="me-2"
          onChange={(event) => {
            setSearchedValue(event.target.value);
          }}
        />
        <Button type="submit" className="text-white text-nowrap">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="opacity-75 me-2" size="xs" />Caută
        </Button>
      </Form>
      <Row xs={1} md={2} lg={3} className="g-4 flex-fill" ref={animationParent}>
        {users.map((user) => (
          <Col key={user._id}>
            <Card>
              <Card.Img
                style={{
                  maxHeight: "250px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                variant="top"
                src={user.profileImage || noAvatar}
              ></Card.Img>
              <Card.Body>
                <Card.Title>{user.name}</Card.Title>
                <Card.Text>{user.email}</Card.Text>
                <Form.Select
                  disabled={currentUser._id === user._id}
                  className="mb-3"
                  value={user.role._id}
                  onChange={(event) => editRole(user._id, event.target.value)}
                >
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </Form.Select>

                <ButtonGroup className="w-100 d-flex">
                  {user.isActive ? (
                    <Button
                      disabled={currentUser._id === user._id}
                      variant="outline-secondary"
                      onClick={() => {
                        setActivateUser(user._id, false);
                      }}
                    >
                      Dezactivează
                    </Button>
                  ) : (
                    <Button
                      disabled={currentUser._id === user._id}
                      variant="outline-secondary"
                      onClick={() => {
                        setActivateUser(user._id, true);
                      }}
                    >
                      Activează
                    </Button>
                  )}
                  <Button
                    disabled={currentUser._id === user._id}
                    variant="outline-secondary"
                    onClick={() => {
                      deleteUser(user._id);
                    }}
                  >
                    Șterge
                  </Button>
                </ButtonGroup>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <Pagination
        className="mt-3"
        currentPage={currentPage}
        pagesCount={Math.ceil(allItemsCount / ITEMS_PER_PAGE)}
        gotoPage={gotoPage}
      />
    </Container>
  );
}
