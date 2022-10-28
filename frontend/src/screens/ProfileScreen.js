import axios from "axios";
import React, { useContext, useReducer, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import PasswordCheckList from "react-password-checklist";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { getError } from "../utils";

const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault(); //prevents refreshing of the page
    try {
      const conditions = [
        password === confirmPassword,
        password.length >= 8,
        password.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9 #$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]+)$/) != null
      ]
      if (!conditions.includes(false)) {
        const { data } = await axios.put(
          "/api/users/profile",
          {
            name,
            email,
            password,
          },
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS" });
        ctxDispatch({ type: "USER_SIGNIN", payload: data }); //update the application context on the new user info
        localStorage.setItem("userInfo", JSON.stringify(data));
        toast.success("User information updated successfully");
      } else {
        toast.error("User information failed to update");
      }
    } catch (err) {
      dispatch({ type: "FETCH_FAIL" });
      toast.error(getError(err));
    }

  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>Edit Profile</title>
      </Helmet>
      <h1 className="my-3">Edit Profile</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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
          <Button type="submit">Update</Button>
        </div>
      </Form>
    </div>
  );
}
