import { useLocation, Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { getError } from "../utils";

export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation(); //to get only the "search" portion of the URL (signin?redirect=/shipping), which is redirect=/shipping
  const redirectInUrl = new URLSearchParams(search).get("redirect"); //get the value of redirect, which would be /shipping if came from checkout
  const redirect = redirectInUrl ? redirectInUrl : "/"; //if empty then use /

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store); //to use the context that was already defined
  const { userInfo } = state;

  const submitHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    try {
      const { data } = await axios.post("/api/users/signin", {
        email,
        password,
      });
      //after successful login
      ctxDispatch({ type: "USER_SIGNIN", payload: data }); //payload that is passed along with action
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(redirect || "/"); //redirect to shipping (if clicked from cart, else redirect back to home page cuz is just regular sign in)
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
          <Button type="submit">Sign In</Button>
        </div>
        <div className="mb-3">
          New Customer?{" "}
          <Link to={`/signup?redirect=${redirect}`}>Create your account</Link>
        </div>
      </Form>
    </Container>
  );
}
