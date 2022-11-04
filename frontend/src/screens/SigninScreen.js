import { useLocation, Link, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Recaptcha from 'react-google-recaptcha'; // remove <React.StrictMode> tag in index.js to remove recaptcha bug cause from back button, anyway strict mode is only use in development and not in production application
import React, { useRef } from 'react';

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation(); //to get only the "search" portion of the URL (signin?redirect=/shipping), which is redirect=/shipping
  const redirectInUrl = new URLSearchParams(search).get('redirect'); //get the value of redirect, which would be /shipping if came from checkout
  const redirect = redirectInUrl ? redirectInUrl : '/'; //if empty then use /
  const captchaRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { state } = useContext(Store); //to use the context that was already defined
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    const token = captchaRef.current.getValue();
    captchaRef.current.reset();
    try {
      const conditions = [
        password.length >= 8 && password.length < 128,
        password.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9 #$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]+)$/) != null
      ]
      if (!conditions.includes(false)) {
        const { data } = await axios.post('/api/users/signin', {
          token,
          email,
          password,
        });
        //after successful login
        localStorage.setItem('validUserIdEmail', JSON.stringify(data)); // only storing valid user id/email locally for token verification
        navigate('/verify'); //redirect back to OTP screen
      } else {
        toast.error("Invalid email or password");
      } 
    } catch (err) {
        toast.error(getError(err));
      
    }
  };

  useEffect(() => {
    if (userInfo) {
      //if there is userinfo (i.e. logged in already)
      if (userInfo.isAdmin) {
        navigate("/admin/productlist");
      } else {
        navigate(redirect);
      }
    }
  }, [navigate, redirect, userInfo]);
  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <h1 className="my-3">Sign In</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Link to={'/forgotpassword'}>Forgot Password?</Link>
        </div>
        <Recaptcha
          className='mb-3'
          sitekey="6LfBO1wiAAAAABMihKPtNV-GN0nqvZdvarzmIEV_"
          ref={captchaRef}
        />
        <div className="mb-3">
          <Button type="submit">Sign In</Button>
        </div>
        <div className="mb-3">
          New Customer?{' '}
          <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>
        </div>
      </Form>
    </Container>
  );
}
