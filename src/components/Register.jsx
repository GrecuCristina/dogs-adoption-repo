import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Alert } from "react-bootstrap";

import { API_URL } from "../constants";

export default function Register() {
  const [errors, setErrors] = useState([]);

  const onRegister = (event) => {
    event.preventDefault();

    const form = event.target;
    axios
      .post(`${API_URL}/register`, {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        rePassword: form.rePassword.value,
        ts: form.ts.checked,
      })
      .then((res) => {
        setErrors(res.data.errors);
        if (res.data.success) {
          window.location.replace("/login");
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
      <h2>Register</h2>
      <Form onSubmit={onRegister}>
        <Form.Group className="mb-3">
          <Form.Label>Nume</Form.Label>
          <Form.Control type="name" placeholder="Nume" name="name" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Adresa de e-mail</Form.Label>
          <Form.Control type="email" placeholder="nume@exemplu.com" name="email" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Parola</Form.Label>
          <Form.Control type="password" name="password" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Reintrodu Parola</Form.Label>
          <Form.Control type="password" name="rePassword" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
          type="checkbox"
          label="Sunt de acord cu Termenii și Condițiile"
          name="ts"
          />
        </Form.Group>
        <Button variant="primary" type="submit">Trimite</Button>
      </Form>
      <br />
      {showErrors()}
    </Container>
  );
}
