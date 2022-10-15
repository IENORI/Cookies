import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    try {
      const { data } = await axios.post('/api/users/resetpassword', {
        email,
      });
      toast.success(data);
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Password Reset</title>
      </Helmet>
      <h1 className="my-3 text-center">Password reset</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Your email address"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button className='w-100' type="submit">Send</Button>
        </div>
        <div className="mb-3 text-center">
          <Link to={'/signin'}>Back to Login</Link>
        </div>
      </Form>
    </Container>
  );
}
