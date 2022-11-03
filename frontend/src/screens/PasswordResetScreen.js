import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import PasswordCheckList from 'react-password-checklist';

export default function PasswordResetScreen() {
  const [password, setPassword] = useState('');
  const windowUrl = window.location.search;
  const params = new URLSearchParams(windowUrl);
  const token = params.get("token");
  const userId = params.get("id");

  const submitHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    try {
      const conditions = [
        password.length >= 8 && password.length < 128,
        password.match(
          /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9 #$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]+)$/
        ) != null,
      ];
      if (!conditions.includes(false)) {
        const { data } = await axios.post('/api/users/verifyreset', {
          password,
          userId: userId,
          token: token
        });
        toast.success(data);
        setTimeout(function () {
          window.location.href = '/signin'; //redirect user back to sign in screen
        }, 3000)
      }else{
        toast.error("Password conditions not match, try again");
      }
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
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="New password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordCheckList
            rules={['minLength', 'number', 'letter']}
            minLength={8}
            value={password}
            onChange={(isValid) => {}}
          />
        </Form.Group>
        <div className="mb-3">
          <Button className="w-100" type="submit">
            Reset
          </Button>
        </div>
      </Form>
      <div className="mb-3 text-center">
          <Link to={'/signin'}>Back to Login</Link>
        </div>
    </Container>
  );
}
