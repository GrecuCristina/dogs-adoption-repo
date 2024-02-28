import React, { useState, useEffect } from "react";
import { Row, Col, ProgressBar } from "react-bootstrap";

import { JWT_KEY, API_URL } from "../constants";
import axios from "axios";

export default function GeneralStatistics() {
  const userJwt = localStorage.getItem(JWT_KEY);

  const [userStats, setUserStats] = useState({ totalUsers: 0, activeUsers: 0 });
  const [postStats, setPostStats] = useState({
    totalPosts: 0,
    hiddenPosts: 0,
    adoptedPosts: 0,
  });
  const [reactionStats, setReactionStats] = useState({
    totalReactions: 0,
    likes: 0,
    dislikes: 0,
    loves: 0,
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/admin/generalStatistics`, {
        headers: { Authorization: `Bearer ${userJwt || ""}` },
      })
      .then((res) => {
        if (res.data.success) {
          setUserStats(res.data.userStats);
          setPostStats(res.data.postStats);
          setReactionStats(res.data.reactionStats);
        }
      });
  }, []);
  const activeUsersPercentage = (
    (userStats.activeUsers / userStats.totalUsers) *
    100
  ).toFixed(2);
  const adoptedPostsPercentage = (
    (postStats.adoptedPosts / postStats.totalPosts) *
    100
  ).toFixed(2);
  const hiddenPostsPercentage = (
    (postStats.hiddenPosts / postStats.totalPosts) *
    100
  ).toFixed(2);
  const lovePercentage = (
    (reactionStats.loves / reactionStats.totalReactions) *
    100
  ).toFixed(2);
  const likePercentage = (
    (reactionStats.likes / reactionStats.totalReactions) *
    100
  ).toFixed(2);
  const dislikePercentage = (
    (reactionStats.dislikes / reactionStats.totalReactions) *
    100
  ).toFixed(2);

  return (
    <Row md={3} xs={1} className="g-4">
      <Col>
        <h5> Statistici utilizatori</h5>
        <div className="d-flex align-items-center mb-3">
          <h2 className="m-0 me-3 text-primary">{userStats.totalUsers}</h2>
          <div className="d-flex flex-column">
            <span>Utilizatori</span>
            <small className="text-muted">în total</small>
          </div>
        </div>
        <div className="d-flex flex-column">
          <div className="d-flex flex-column mb-3">
            <span className="text-muted mb-1">Conturi active</span>
            <ProgressBar
              now={activeUsersPercentage}
              label={`${activeUsersPercentage}%`}
            />
          </div>
        </div>
      </Col>
      <Col>
        <h5> Statistici anunțuri</h5>
        <div className="d-flex align-items-center mb-3">
          <h2 className="m-0 me-3 text-primary">{postStats.totalPosts}</h2>
          <div className="d-flex flex-column">
            <span>Anunțuri</span>
            <small className="text-muted">în total</small>
          </div>
        </div>
        <div className="d-flex flex-column">
          <div className="d-flex flex-column mb-3">
            <span className="text-muted mb-1">Câini adoptați</span>
            <ProgressBar
              now={adoptedPostsPercentage}
              label={`${adoptedPostsPercentage}%`}
            />
          </div>

          <div className="d-flex flex-column mb-3">
            <span className="text-muted mb-1">Anunțuri ascunse</span>
            <ProgressBar
              now={hiddenPostsPercentage}
              label={`${hiddenPostsPercentage}%`}
            />
          </div>
        </div>
      </Col>

      <Col>
        <h5> Statistici reacții</h5>
        <div className="d-flex align-items-center mb-3">
          <h2 className="m-0 me-3 text-primary">
            {reactionStats.totalReactions}
          </h2>
          <div className="d-flex flex-column">
            <span>Reacții</span>
            <small className="text-muted">în total</small>
          </div>
        </div>
        <div className="d-flex flex-column">
          <div className="d-flex flex-column mb-3">
            <span className="text-muted mb-1">Ador</span>
            <ProgressBar now={lovePercentage} label={`${lovePercentage}%`} />
          </div>

          <div className="d-flex flex-column mb-3">
            <span className="text-muted mb-1">Îmi place</span>
            <ProgressBar now={likePercentage} label={`${likePercentage}%`} />
          </div>

          <div className="d-flex flex-column mb-3">
            <span className="text-muted mb-1">Nu îmi place</span>
            <ProgressBar
              now={dislikePercentage}
              label={`${dislikePercentage}%`}
            />
          </div>
        </div>
      </Col>
    </Row>
  );
}
