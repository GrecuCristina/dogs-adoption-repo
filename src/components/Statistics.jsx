import React from "react";
import { Container, Tabs, Tab } from "react-bootstrap";

import GeneralStatistics from "./GeneralStatistics";
import PostsStatistics from "./PostsStatistics";
import UsersStatistics from "./UsersStatistics";

export default function Statistics() {
  return (
    <Container className="d-flex flex-column">
      <h4>Statistici</h4>
      <Tabs defaultActiveKey={"generalStatistics"} fill className="mb-3">
        <Tab eventKey="generalStatistics" title="Statistici generale">
          <GeneralStatistics></GeneralStatistics>
        </Tab>
        <Tab eventKey="postsPerMonth" title="Anunțuri pe lună">
          <PostsStatistics></PostsStatistics>
        </Tab>
        <Tab eventKey="usersPerMonth" title="Utilizatori pe lună">
          <UsersStatistics></UsersStatistics>
        </Tab>
      </Tabs>
    </Container>
  );
}
