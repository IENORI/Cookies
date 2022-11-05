import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from "../utils";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    try {
      const { data } = await axios.post('/api/users/resetpassword', {
        email,
      });
      toast.success(data);
      setTimeout(function () {
        window.location.href = '/signin'; //redirect user back to sign in screen
      }, 3000)
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Container className="container">
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">Forgot Password</li>
        </ol>
      </nav>
      <h1 className="my-3">Forgot Password</h1>
      <div className="alert alert-info" role="alert">
        Forgot your password? No worries! Request a reset by entering your registered <strong>Email Address.</strong>
      </div>
      <div className="col">
        <div className="row">
          <div className="container d-flex justify-content-center">
            <div className="col col-lg-8 col-xl-6 card p-3">
              <Form onSubmit={submitHandler}>
                <strong>Account Details</strong>
                <Form.Group className="mb-3 mt-3 input-group" controlId="email">
                  {/* <Form.Label>Email address</Form.Label> */}
                  <span className="input-group-text" id="emailTag">Email</span>
                  <Form.Control
                    type="email"
                    placeholder="Your Registered Email Address"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <div className="">
                  <Button className='w-100' type="submit">Send Reset Request</Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
