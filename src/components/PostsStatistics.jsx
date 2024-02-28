import React, { useMemo, useState, useEffect } from "react";
import { Container } from "react-bootstrap";

import { JWT_KEY, API_URL } from "../constants";
import axios from "axios";

import { Chart } from "react-charts";

export default function PostsStatistics() {
  const userJwt = localStorage.getItem(JWT_KEY);

  const [postStatistics, setPostStatistics] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/admin/postStatistics`, {
        headers: { Authorization: `Bearer ${userJwt || ""}` },
      })
      .then((res) => {
        if (res.data.success) {
          setPostStatistics(res.data.postStatistics);
        }
      });
  }, []);

  const data = useMemo(
    () => [
      {
        label: "Număr anunțuri",
        data: postStatistics.map((postStatistic) => {
          return [
            new Date(postStatistic[0]).toLocaleString("ro-ro", {
              month: "long",
            }),
            postStatistic[1],
          ];
        }),
      },
    ],
    [postStatistics]
  );
  const axes = useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      { type: "linear", position: "left" },
    ],
    []
  );
  if (!postStatistics.length) {
    return null;
  }
  return (
    <Container>
      <div
        style={{
          width: "100%",
          height: "500px",
        }}
      >
        <Chart tooltip data={data} axes={axes} />
      </div>
    </Container>
  );
}
