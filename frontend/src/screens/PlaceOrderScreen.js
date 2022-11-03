import React, { useContext, useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { Helmet } from "react-helmet-async";
import CheckoutSteps from "../components/CheckoutSteps";
import { Store } from "../Store";
import { toast } from "react-toastify";
import { getError } from "../utils";
import axios from "axios";
import LoadingBox from "../components/LoadingBox";

const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  //for item price
  const roundTo = (num) => Math.round(num * 100 + Number.EPSILON) / 100; //xxx.xxxx => xxx.xx
  cart.itemsPrice = roundTo(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  //for shipping price
  cart.shippingPrice = cart.itemsPrice > 100 ? roundTo(2) : roundTo(10);
  //for tax price (15% GST)
  cart.taxPrice = roundTo(0.15 * cart.itemsPrice);
  //total price = shipping + tax + item
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post(
        "/api/orders",
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: 0, // Calculated at backend
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0, 
        },
        {
          headers: {
            //used to match the token, so is authentication will use isauth later as middleware
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: "CART_CLEAR" }); //for context
      dispatch({ type: "CREATE_SUCCESS" }); //for context here only
      localStorage.removeItem("cartItems");
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: "CREATE_FAIL" });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      //missing payment method
      navigate("/payment");
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Order</title>
      </Helmet>
      <h1 className="my-3">Preview Order</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name:</strong> <code>{cart.shippingAddress.fullName}</code>
                <br />
                <strong>Address:</strong> <code>{cart.shippingAddress.address}</code>,{" "}
                <code>{cart.shippingAddress.city}</code>, <code>{cart.shippingAddress.postalCode}</code>
                <br />
              </Card.Text>
              <Link class="mt-3 btn btn-secondary" to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> <code>{cart.paymentMethod}</code>
              </Card.Text>
              <Link class="mt-3 btn btn-secondary" to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                <Row className="align-items-center">
                  <Col md={8}></Col>
                  <Col md={2}><b>Quantity</b></Col>
                  <Col md={2}><b>Unit Cost</b></Col>
                </Row>
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={3}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>
                      </Col>
                      <Col md={5}><Link to={`/product/${item.slug}`}>{item.name}</Link></Col>
                      <Col md={2}>
                        <span><code>{item.quantity}</code></span>
                      </Col>
                      <Col md={2}>$ <code>{item.price}</code></Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link class="mt-3 btn btn-secondary" to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>$ <code>{cart.itemsPrice.toFixed(2)}</code></Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>$ <code>{cart.shippingPrice.toFixed(2)}</code></Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>GST</Col>
                    <Col>$ <code>{cart.taxPrice.toFixed(2)}</code></Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>
                      <strong>$ <code>{cart.totalPrice.toFixed(2)}</code></strong>
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                    {loading && <LoadingBox />}
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
