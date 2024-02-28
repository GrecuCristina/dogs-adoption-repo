import React, { useMemo, useState, useEffect } from "react";
import { Container } from "react-bootstrap";

import { JWT_KEY, API_URL } from "../constants";
import axios from "axios";

import { Chart } from "react-charts";

export default function UsersStatistics() {
  const userJwt = localStorage.getItem(JWT_KEY);

  const [userStatistics, setUserStatistics] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/admin/userStatistics`, {
        headers: { Authorization: `Bearer ${userJwt || ""}` },
      })
      .then((res) => {
        if (res.data.success) {
          setUserStatistics(res.data.userStatistics);
        }
      });
  }, []);

  const data = useMemo(
    () => [
      {
        label: "Număr utilizatori",
        data: userStatistics.map((userStatistic) => {
          return [
            new Date(userStatistic[0]).toLocaleString("ro-ro", {
              month: "long",
            }),
            userStatistic[1],
          ];
        }),
      },
    ],
    [userStatistics]
  );
  const axes = useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      { type: "linear", position: "left" },
    ],
    []
  );
  if (!userStatistics.length) {
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
