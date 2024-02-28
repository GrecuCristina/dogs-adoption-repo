import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Alert } from "react-bootstrap";

import { API_URL, JWT_KEY } from "../constants";

export default function Login() {
  const [errors, setErrors] = useState([]);

  const onLogin = (event) => {
    event.preventDefault();

    const form = event.target;
    axios
      .post(`${API_URL}/login`, {
        email: form.email.value,
        password: form.password.value,
      })
      .then((res) => {
        setErrors(res.data.errors);

        if (res.data.success) {
          localStorage.setItem(JWT_KEY, res.data.jwt);
          window.location.replace("/");
        }
      });
  };

  const showErrors = () => {
    if (!errors.length) {
      return null;
    }
    return (
      <>
        {errors.map((error, index) => (
          <Alert key={index} variant="danger">{error}</Alert>
        ))}
      </>
    );
  };

  return (
    <Container fluid="sm" className="narrow-form-container">
      <h2>Intră în cont</h2>
      <Form onSubmit={onLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Adresa de e-mail</Form.Label>
          <Form.Control type="email" placeholder="nume@exemplu.com" name="email" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Parola</Form.Label>
          <Form.Control type="password" name="password" />
        </Form.Group>
        <Button variant="primary" type="submit">Trimite</Button>
      </Form>
      <br />
      {showErrors()}
    </Container>
  );
}
