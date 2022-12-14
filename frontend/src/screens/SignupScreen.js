import { useLocation, Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PasswordCheckList from "react-password-checklist";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { getError } from "../utils";
import Recaptcha from 'react-google-recaptcha'; // remove <React.StrictMode> tag in index.js to remove recaptcha bug cause from back button, anyway strict mode is only use in development and not in production application

export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation(); //to get only the "search" portion of the URL (signin?redirect=/shipping), which is redirect=/shipping
  const redirectInUrl = new URLSearchParams(search).get("redirect"); //get the value of redirect, which would be /shipping if came from checkout
  const redirect = redirectInUrl ? redirectInUrl : "/"; //if empty then use /

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store); //to use the context that was already defined
  const { userInfo } = state;

  const captchaRef = useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    const token = captchaRef.current.getValue();
    captchaRef.current.reset();
    try {
      const conditions = [
        password === confirmPassword,
        password.length >= 8 && password.length <128,
        password.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9 #$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]+)$/) != null
      ]
      if (!conditions.includes(false)) {
        const { data } = await axios.post(
          "/api/users/signup",
        {
          token,
          name,
          email,
          password,
          confirmPassword
        });
        //after successful login
        ctxDispatch({ type: "USER_SIGNIN", payload: data }); //payload that is passed along with action
        delete data['isAdmin'];
        localStorage.setItem("userInfo", JSON.stringify(data));
        window.location.href = '/' //redirect to shipping (if clicked from cart, else redirect back to home page cuz is just regular sign in)
      } else {
        toast.error("Failed to create account");
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      //if there is userinfo (i.e. logged in already)
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);
  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <h1 className="my-3">Sign Up</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control required onChange={(e) => setName(e.target.value)} />
        </Form.Group>
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
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <PasswordCheckList
            rules={["minLength", "match", "number", "letter"]}
            minLength={8}
            value={password}
            valueAgain={confirmPassword}
            onChange={(isValid) => { }}
          />
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Sign Up</Button>
        </div>
        <Recaptcha
          sitekey="6LfBO1wiAAAAABMihKPtNV-GN0nqvZdvarzmIEV_"
          ref={captchaRef}
        />
        <div className="mb-3">
          Already have an account?{" "}
          <Link to={`/signin?redirect=${redirect}`}>Sign In</Link>
        </div>
      </Form>
    </Container>
  );
}
