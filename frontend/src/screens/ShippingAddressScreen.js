import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { Store } from "../Store";
import CheckoutSteps from "../components/CheckoutSteps";
import { toast } from "react-toastify";

export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [fullName, setFullName] = useState(shippingAddress.fullName || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "");

  function letters(str){
    return /^[A-Za-z ]*$/.test(str);
  }
  function numbers(str){
    return /^[0-9]*$/.test(str);
  }

  useEffect(() => {
    if (!userInfo) {
      navigate("/signin");
    }
  }, [userInfo, navigate]);
  const submitHandler = (e) => {
    e.preventDefault(); //prevent refreshing
    ctxDispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: {
        fullName,
        address,
        city,
        postalCode,
      },
    });
    //save shipping address locally
    if (letters(fullName)){
      if (letters(city)){
        if (numbers(postalCode)){
          localStorage.setItem(
            "shippingAddress",
            JSON.stringify({
              fullName,
              address,
              city,
              postalCode,
            })
          );
          //go to payment
          navigate("/payment");
        }
        else{
          toast.error("Postal Code should only contain numbers!")
        }
      }
      else {
        toast.error("City should only contain letters!")
      }
    }
    else {
      toast.error("Full Name should only contain letters!");
    }
  };
  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h1 className="my-3">Shipping Address</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              value={fullName}
              type="text"
              minlength="3"
              maxlength="128"
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              value={address}
              type="text"
              minlength="3"
              maxlength="128"
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control
              value={city}
              type="text"
              minlength="3"
              maxlength="128"
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>Postal Code</Form.Label>
            <div className="input-group">
              <span class="input-group-text">Singapore</span>
              <Form.Control
                value={postalCode}
                type="text"
                minlength="6"
                maxlength="6"
                min="0"
                placeholder="000000"
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
          </Form.Group>
          <div className="mb-3">
            <Button variant="primary" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
