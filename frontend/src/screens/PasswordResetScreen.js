import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import PasswordCheckList from 'react-password-checklist';

export default function PasswordResetScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
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
    <Container className="container">
      <Helmet>
        <title>Password Reset</title>
      </Helmet>
      <h1 className="my-3">Password Reset</h1>
      <div className="alert alert-danger" role="alert">
        You are about to reset your <strong>password</strong>.
        <br/>
        If this action was not requested by you, please <strong>CANCEL</strong> this prompt.
      </div>
      <div className="col">
        <div className="row">
          <div className="container d-flex justify-content-center">
            <div className="col col-lg-8 col-xl-6 card p-3">
              <Form onSubmit={submitHandler}>
                <strong>Password</strong>
                <Form.Group className="mb-3 mt-3 input-group" controlId="password">
                  <span className="input-group-text" id="newPasswordTag">New Password</span>
                  <Form.Control
                    type="password"
                    placeholder="New password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3 input-group">
                  <span className="input-group-text" id="repeatPasswordTag">Repeat Password</span>
                  <Form.Control
                    type="password"
                    placeholder="Repeat New password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <PasswordCheckList
                  className="m-3"
                  rules={['minLength', 'number', 'letter', 'match']}
                  minLength={8}
                  value={password}
                  valueAgain={confirmPassword}
                  onChange={(isValid) => {}}
                  />
                <div className="mb-3">
                  <Button className="w-100" type="submit">
                    Reset Password
                  </Button>
                </div>
              </Form>
              <div className="mb-3 text-center">
                  <Button className="w-50 btn-light" href="/signin">
                    Cancel
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
