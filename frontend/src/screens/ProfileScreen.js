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
  const [verifyPassword, setVerifyPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldpassword, setOldPassword]= useState("");

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const accountDetailSubmitHandler = async (e) => {
    e.preventDefault(); //prevents refreshing of the page
    try {
      const conditions = [
        verifyPassword.length >= 8 && verifyPassword.length <128,
      ]
      if (!conditions.includes(false)) {
        await axios.put(
          `/api/users/update/details/${userInfo._id}`,
          {
            name,
            email,
            verifyPassword
          },
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS" });
        toast.success("User information updated successfully");
        localStorage.removeItem('validUserIdEmail'); //nuke localstorage
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        setTimeout(function () {
          window.location.href = '/signin'; //redirect user back to sign in screen
        }, 3000)
      } else {
        toast.error("User information failed to update");
      }
    } catch (err) {
      dispatch({ type: "FETCH_FAIL" });
      toast.error(getError(err));
    }
  };

  const passwordUpdateSubmitHandler = async (e) => {
    e.preventDefault(); //prevents refreshing of the page
    try {
      const conditions = [
        password === confirmPassword,
        password.length >= 8 && password.length <128,
        password.match(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9 #$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]+)$/) != null
      ]
      if (!conditions.includes(false)) {
        await axios.put(
          `/api/users/update/password/${userInfo._id}`,
          {
            oldpassword,
            password
          },
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "FETCH_SUCCESS" });
        toast.success("User information updated successfully");
        localStorage.removeItem('validUserIdEmail'); //nuke localstorage
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        setTimeout(function () {
          window.location.href = '/signin'; //redirect user back to sign in screen
        }, 3000)
      } else {
        toast.error("User information failed to update");
      }
    } catch (err) {
      dispatch({ type: "FETCH_FAIL" });
      toast.error(getError(err));
    }
  };

  return (
    <div className="container">
      <Helmet>
        <title>Edit Profile</title>
      </Helmet>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">Edit Profile</li>
        </ol>
      </nav>
      <h1 className="my-3">Edit Profile</h1>
      <div className="alert alert-warning" role="alert">
        Changing settings here will <strong>log you out!</strong>
      </div>
      <div className="col">
        <div className="row">
          <div className="container d-flex justify-content-center">
            <div className="col col-lg-8 col-xl-6 card p-3">
              <Form onSubmit={accountDetailSubmitHandler}>
                <strong>Account Details</strong>
                <Form.Group className="mb-3 mt-3 input-group" controlId="name">
                  <span className="input-group-text" id="nameTag">Name</span>
                  <Form.Control
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  />
                </Form.Group>
                <Form.Group className="mb-3 input-group" controlId="email">
                  <span className="input-group-text" id="emailTag">Email</span>
                  <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  />
                </Form.Group>
                <hr className="mt-4 mb-4"/>
                <Form.Group className="mb-3 input-group">
                  <span className="input-group-text" id="verificationTag">Password</span>
                  <Form.Control
                  type="password"
                  minLength={8}
                  placeholder="Password for verification"
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  required
                  />
                  <button id="toggle-password" type="button" className="d-none"
                    aria-label="Show password as plain text. Warning: this will display your password on the screen.">
                  </button>
                </Form.Group>
                <div className="d-grid d-md-flex justify-content-md-end">
                  <Button type="submit">Update Details</Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
        <br/>
        <div className="row">
          <div className="container d-flex justify-content-center">
            <div className="col col-lg-8 col-xl-6 card p-3">
              <Form onSubmit={passwordUpdateSubmitHandler}>
                <strong>Password</strong>
                <Form.Group className="mb-3 mt-3 input-group" controlId="oldpassword">
                  <span className="input-group-text" id="oldPasswordTag">Old Password</span>
                  <Form.Control
                    type="password"
                    minLength={8}
                    value={oldpassword}
                    placeholder="Old Password"
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3 input-group" controlId="password">
                  <span className="input-group-text" id="nameTag">New Password</span>
                  <Form.Control
                    type="password"
                    minLength={8}
                    value={password}
                    placeholder="New password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3 input-group">
                  <span className="input-group-text" id="nameTag">Repeat Password</span>
                  <Form.Control
                    type="password"
                    minLength={8}
                    value={confirmPassword}
                    placeholder="Repeat New password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <PasswordCheckList
                    className="m-3"
                    rules={["minLength", "number", "letter", "match"]}
                    minLength={8}
                    value={password}
                    valueAgain={confirmPassword}
                    onChange={(isValid) => { }}
                  />
                <div className="d-grid d-md-flex justify-content-md-end">
                  <Button type="submit">Update Password</Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
