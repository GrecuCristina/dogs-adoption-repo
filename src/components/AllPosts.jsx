import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form } from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPaw,
  faMarsAndVenus,
  faFilter,
  faSort,
} from "@fortawesome/free-solid-svg-icons";

import { API_URL, JWT_KEY } from "../constants";
import PostsGrid from "./PostsGrid";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 8;

export default function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [counties, setCounties] = useState([]);
  const [county, setCounty] = useState("");
  const [breeds, setBreeds] = useState([]);
  const [breed, setBreed] = useState("");
  const [onlyUnadopted, setOnlyUnadopted] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("newest");

  const [currentPage, setCurrentPage] = useState(0);
  const [allItemsCount, setAllItemsCount] = useState(0);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const userJwt = localStorage.getItem(JWT_KEY);

  useEffect(() => {
    getRecommendations();

    axios.get(`${API_URL}/counties`).then((res) => {
      if (res.data.success) {
        const countiesNameNew = res.data.counties;

        setCounties([{ _id: "", name: "Toate" }, ...countiesNameNew]);
      }
    });

    axios.get(`${API_URL}/breeds`).then((res) => {
      if (res.data.success) {
        const breedsNameNew = res.data.breeds;

        setBreeds([{ _id: "", name: "Toate" }, ...breedsNameNew]);
      }
    });

    axios
      .get(`${API_URL}/posts`, {
        params: {
          itemsCount: ITEMS_PER_PAGE,
          itemsOffset: currentPage * ITEMS_PER_PAGE,
        },
        headers: { Authorization: `Bearer ${userJwt || ""}` },
      })
      .then((res) => {
        if (res.data.success) {
          const allPosts = res.data.posts;
          setAllItemsCount(res.data.allItemsCount);
          setPosts(allPosts);
        }
      });
  }, []);

  const filterPosts = (filterParams, sortOrder, pageNumber = 0) => {
    axios
      .get(`${API_URL}/posts`, {
        params: {
          breed: filterParams.breed,
          county: filterParams.county,
          onlyUnadopted: filterParams.onlyUnadopted,
          gender: filterParams.selectedGender,
          sortOrder: sortOrder,
          itemsCount: ITEMS_PER_PAGE,
          itemsOffset: pageNumber * ITEMS_PER_PAGE,
        },
        headers: { Authorization: `Bearer ${userJwt || ""}` },
      })
      .then((res) => {
        console.log(res);
        if (res.data.success) {
          const posts = res.data.posts;
          setAllItemsCount(res.data.allItemsCount);
          setPosts(posts);
        }
      });
  };

  const filterPostsByCounty = (ev) => {
    const countyId = ev.target.value;
    setCounty(countyId);
    setCurrentPage(0);
    filterPosts(
      {
        county: countyId,
        breed: breed,
        onlyUnadopted: onlyUnadopted,
        selectedGender: selectedGender,
      },
      selectedOrder
    );
  };
  const filterPostsByBreed = (ev) => {
    const breedId = ev.target.value;
    setBreed(breedId);
    setCurrentPage(0);

    filterPosts(
      {
        county: county,
        breed: breedId,
        onlyUnadopted: onlyUnadopted,
        selectedGender: selectedGender,
      },
      selectedOrder
    );
  };
  const filterPostsByAdoption = (ev) => {
    const onlyUnadopted = ev.target.checked;
    console.log("onlyUnadopted", onlyUnadopted);
    setOnlyUnadopted(onlyUnadopted);
    setCurrentPage(0);

    filterPosts(
      {
        county: county,
        breed: breed,
        onlyUnadopted: onlyUnadopted,
        selectedGender: selectedGender,
      },
      selectedOrder
    );
  };
  const filterPostsByGender = (ev) => {
    const selectedGender = ev.target.value;
    setSelectedGender(selectedGender);
    setCurrentPage(0);

    filterPosts(
      {
        county: county,
        breed: breed,
        onlyUnadopted: onlyUnadopted,
        selectedGender: selectedGender,
      },
      selectedOrder
    );
  };

  const sortPosts = (ev) => {
    const selectedSort = ev.target.value;
    setSelectedOrder(selectedSort);
    setCurrentPage(0);

    filterPosts(
      {
        county: county,
        breed: breed,
        onlyUnadopted: onlyUnadopted,
        selectedGender: selectedGender,
      },
      selectedSort
    );
  };

  const gotoPage = (pageNumber) => {
    setCurrentPage(pageNumber);

    filterPosts(
      {
        county: county,
        breed: breed,
        onlyUnadopted: onlyUnadopted,
        selectedGender: selectedGender,
      },
      selectedOrder,
      pageNumber
    );
  };

  const getRecommendations = () => {
    axios
      .get(`${API_URL}/recommendations`, {
        headers: { Authorization: `Bearer ${userJwt}` },
      })
      .then((res) => {
        if (res.data.success) {
          setRecommendedPosts(res.data.recommendedPosts);
        }
      });
  };

  return (
    <Container className="d-flex flex-column">
      {recommendedPosts.length > 0 && (
        <Row className="mb-3">
          <h4 className="mb-3">Anunțuri recomandate</h4>
          <PostsGrid posts={recommendedPosts}></PostsGrid>
        </Row>
      )}

      <Row className="mb-3">
        <h4>Toate anunțurile</h4>
      </Row>
      <Row className="flex-fill">
        <Col md={3}>
          <Row className="mb-2">
            <h5>
              <FontAwesomeIcon
                icon={faFilter}
                className="opacity-50 me-2"
                size="xs"
              />
              Filtrează
            </h5>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="opacity-50 me-2"
                  size="xs"
                />
                Județ
              </Form.Label>
              <Form.Select
                name="county"
                id="counties"
                value={county}
                onChange={filterPostsByCounty}
              >
                {counties.map((county) => (
                  <option value={county._id} key={county._id}>
                    {county.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon
                  icon={faPaw}
                  className="opacity-50 me-2"
                  size="xs"
                />
                Rasă
              </Form.Label>
              <Form.Select
                name="breed"
                id="breeds"
                value={breed}
                onChange={filterPostsByBreed}
              >
                {breeds.map((breed) => (
                  <option value={breed._id} key={breed._id}>
                    {breed.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FontAwesomeIcon
                  icon={faMarsAndVenus}
                  className="opacity-50 me-2"
                  size="xs"
                />
                Sex
              </Form.Label>
              <Form.Select
                name="gender"
                id="genders"
                value={selectedGender}
                onChange={filterPostsByGender}
              >
                <option value={""}>Toate</option>
                <option value={"male"}>Mascul</option>
                <option value={"female"}>Femelă</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Doar neadoptați"
                onChange={filterPostsByAdoption}
                value={onlyUnadopted}
              />
            </Form.Group>
          </Row>
          <Row className="mb-2">
            <h5>
              <FontAwesomeIcon
                icon={faSort}
                className="opacity-50 me-2"
                size="xs"
              />
              Sortează
            </h5>
            <Form.Group className="mb-3">
              <Form.Select
                name="sort"
                value={selectedOrder}
                onChange={sortPosts}
              >
                <option value={"newest"}>Cele mai recente</option>
                <option value={"oldest"}>Cele mai vechi</option>
                <option value={"ageDesc"}>Descrescător după vârstă</option>
                <option value={"ageAsc"}>Crecător după vârstă</option>
              </Form.Select>
            </Form.Group>
          </Row>
        </Col>
        <Col className="d-flex flex-column">
          <PostsGrid posts={posts}></PostsGrid>
          <Pagination
            className="mt-3"
            currentPage={currentPage}
            pagesCount={Math.ceil(allItemsCount / ITEMS_PER_PAGE)}
            gotoPage={gotoPage}
          />
        </Col>
      </Row>
    </Container>
  );
}
