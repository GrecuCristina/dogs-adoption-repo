import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, JWT_KEY } from "../constants";
import { useParams, useNavigate } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Form,
  Button,
  Container,
  Alert,
  Image,
  CloseButton,
  Row,
  Col,
} from "react-bootstrap";

export default function AddPost(props) {
  const [errors, setErrors] = useState([]);
  const [breedsName, setBreedsName] = useState([]);
  const [counties, setCounties] = useState([]);
  const [county, setCounty] = useState("");
  const [images, setImages] = useState([]);
  const [breedUnknown, setBreedUnknown] = useState(false);
  const [wasAdopted, setWasAdopted] = useState(false);
  const [breed, setBreed] = useState("");
  const [petName, setPetName] = useState("");
  const [age, setAge] = useState(0);
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("male");
  const [imagesRef] = useAutoAnimate();

  const { postId } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/breeds`).then((res) => {
      if (res.data.success) {
        const breedsNameNew = res.data.breeds;
        if (!breed) {
          setBreed(breedsNameNew[0]._id);
        }
        setBreedsName(breedsNameNew);
      }
    });

    axios.get(`${API_URL}/counties`).then((res) => {
      if (res.data.success) {
        const countiesNameNew = res.data.counties;
        if (!county) {
          setCounty(countiesNameNew[0]._id);
        }
        setCounties(countiesNameNew);
      }
    });

    if (props.edit && postId) {
      const userJwt = localStorage.getItem(JWT_KEY);
      axios
        .get(`${API_URL}/post/${postId}/edit`, {
          headers: { Authorization: `Bearer ${userJwt}` },
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.success) {
            setImages(res.data.post.images);
            setBreedUnknown(res.data.post.unknownBreed);
            setWasAdopted(res.data.post.wasAdopted);
            res.data.post.breed && setBreed(res.data.post.breed._id);
            res.data.post.county && setCounty(res.data.post.county._id);
            setPetName(res.data.post.petName);
            setAge(res.data.post.age);
            setGender(res.data.post.gender);
            setDescription(res.data.post.description);
          } else {
            navigate("/");
          }
        });
    }
  }, []);
  const showErrors = () => {
    if (!errors.length) {
      return null;
    }
    return (
      <>
        {errors.map((error, index) => (
          <Alert key={index} variant="danger">
            {error}
          </Alert>
        ))}
      </>
    );
  };
  const onCreatePost = (event) => {
    event.preventDefault();

    const form = event.target;
    const userJwt = localStorage.getItem(JWT_KEY);
    if (userJwt) {
      if (!props.edit) {
        axios
          .post(
            `${API_URL}/post`,
            {
              breed: breed,
              breedUnknown: breedUnknown,
              age: age,
              petName: petName,
              description: description,
              gender: gender,
              images: images,
              county: county,
              wasAdopted: wasAdopted,
            },
            {
              headers: { Authorization: `Bearer ${userJwt}` },
            }
          )
          .then((res) => {
            setErrors(res.data.errors);
            if (res.data.success) {
              navigate(`/post/${res.data.postId}`);
            }
          });
      } else {
        axios
          .put(
            `${API_URL}/post/${postId}/edit`,
            {
              breed: breed,
              breedUnknown: breedUnknown,
              wasAdopted: wasAdopted,
              age: age,
              petName: petName,
              description: description,
              gender: gender,
              images: images,
              county: county,
            },
            {
              headers: { Authorization: `Bearer ${userJwt}` },
            }
          )
          .then((res) => {
            setErrors(res.data.errors);
            if (res.data.success) {
              navigate(`/post/${postId}`);
            }
          });
      }
    }
  };
  const updateImages = (event) => {
    console.log("images are ", images);
    const files = [...event.target.files].filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );
    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();

          reader.onload = (event) => {
            resolve(event.target.result);
          };

          reader.readAsDataURL(file);
        });
      })
    ).then((srcArr) => {
      setImages([...images, ...srcArr]);
      event.target.value = "";
    });
  };

  const deleteImage = (imageIndex) => {
    images.splice(imageIndex, 1);
    setImages([...images]);
  };
  console.log("----The breed is ", breed);
  return (
    <Container fluid="sm" className="medium-form-container">
      <h2>{props.edit ? `Edit your post` : `Create post for dog adoption`}</h2>
      <Form onSubmit={onCreatePost}>
        <Form.Group className="mb-3">
          <Form.Label>Imagini</Form.Label>
          <Form.Control
            type="file"
            name="images"
            multiple
            accept="image/png, image/jpeg"
            onChange={updateImages}
          />
        </Form.Group>
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "5px",
            minHeight: "100px",
            boxSizing: "border-box",
            flexWrap: "wrap",
          }}
          className="border rounded mb-3"
          ref={imagesRef}
        >
          {images.map((image, index) => (
            <div
              style={{
                position: "relative",
              }}
              key={index}
            >
              <Image
                src={image}
                thumbnail
                rounded
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
              <CloseButton
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  opacity: 1,
                  padding: "10px",
                  fontSize: "12px",
                }}
                bg="danger"
                className="rounded-circle bg-danger"
                onClick={(ev) => {
                  ev.preventDefault();
                  deleteImage(index);
                }}
              ></CloseButton>
            </div>
          ))}
          {!images.length && (
            <span className="align-self-center mx-auto text-muted">
              Nu ai urcat nicio imagine
            </span>
          )}
        </div>
        <Form.Group className="mb-3">
          <Form.Label>Rasă</Form.Label>
          <Row className="mb-3">
            <Col>
              <Form.Select
                name="breeds"
                id="breeds"
                value={breed}
                onChange={(ev) => setBreed(ev.target.value)}
                disabled={breedUnknown}
              >
                {breedsName.map((breed) => (
                  <option value={breed._id} key={breed._id}>
                    {breed.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Check
                type="checkbox"
                label="Rasă necunoscută"
                checked={breedUnknown}
                onChange={(ev) => setBreedUnknown(ev.target.checked)}
                name="ts"
              />
            </Col>
          </Row>
        </Form.Group>
        <Form.Group>
          <Form.Label>Județ</Form.Label>
          <Form.Select
            name="county"
            id="counties"
            value={county}
            onChange={(ev) => setCounty(ev.target.value)}
          >
            {counties.map((county) => (
              <option value={county._id} key={county._id}>
                {county.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Vârsta cățelului</Form.Label>
          <Form.Control
            name={"age"}
            type="number"
            min="0"
            max="25"
            value={age}
            onChange={(event) => setAge(event.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Numele cățelului</Form.Label>
          <Form.Control
            type="text"
            name={"petName"}
            value={petName}
            onChange={(ev) => setPetName(ev.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Sex</Form.Label>
          <Row className="mb-2">
            <Col>
              <Form.Check
                type="radio"
                label="Mascul"
                name="gender"
                id="male"
                value="male"
                checked={gender === "male"}
                onChange={(ev) => setGender(ev.target.value)}
              />
            </Col>
            <Col>
              <Form.Check
                label="Femelă"
                type="radio"
                name="gender"
                id="female"
                value="female"
                checked={gender === "female"}
                onChange={(ev) => setGender(ev.target.value)}
              />
            </Col>
          </Row>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descriere</Form.Label>
          <Form.Control
            as="textarea"
            name={"description"}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>
            A fost adoptat
            <Form.Check
              type="checkbox"
              name={"wasAdopted"}
              checked={wasAdopted}
              onChange={(ev) => setWasAdopted(ev.target.checked)}
            ></Form.Check>
          </Form.Label>
        </Form.Group>

        <Button type="submit">Trimite</Button>
      </Form>
      {showErrors()}
    </Container>
  );
}
