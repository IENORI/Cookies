import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };
    default:
      return state;
  }
}

export default function OrderAdminScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [selects, setSelects] = useState(null);

  const [{ loading, error, order }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (!order._id) {
      fetchOrder();
    }
  }, [order, userInfo, orderId, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    var isDelivered = false;
    if (selects === 'Delivered') {
      isDelivered = true;
    } else {
      isDelivered = false;
    }
    try {
      const { data } = await axios.put(
        `/api/orders/update/${order._id}`,
        {
          isDelivered,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      toast.success('Order Updated successfully');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order #{orderId} details</title>
      </Helmet>
      <h1 className="my-3">Order #{orderId} details</h1>
      <Card className="mb-3">
        <Row>
          <Col md={4}>
            <Card.Body>
              <Card.Title>General Details</Card.Title>
              <Card.Text>
                <Form>
                  <Form.Group className="mb-3" controlId="exampleForm.Select1">
                    <Form.Label>
                      <strong>Order Date:</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={order.createdAt.substring(0, 10)}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>
                      <strong>Order Status:</strong>
                    </Form.Label>
                    <Form.Select
                      value={
                        selects === null
                          ? order.isDelivered === true
                            ? 'Delivered'
                            : 'Not delivered'
                          : selects
                      }
                      onChange={(e) => setSelects(e.target.value)}
                    >
                      <option value="Not delivered">Not delivered</option>
                      <option value="Delivered">Delivered</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
                <br />
                <Button type="button" variant="primary" onClick={submitHandler}>
                  Save Order
                </Button>
              </Card.Text>
            </Card.Body>
          </Col>
          <Col md={4}>
            <Card.Body>
              <Card.Title>Shipping Address</Card.Title>
              <Card.Text>
                <strong>Address:</strong>
                <br />
                {order.shippingAddress.address},
                <br />
                {order.shippingAddress.city} {order.shippingAddress.postalCode},
                <br />
                {order.shippingAddress.country}
                <br />
                <br />
                <strong>Buyer:</strong>
                <br />
                {order.shippingAddress.fullName}
              </Card.Text>
            </Card.Body>
          </Col>
          <Col md={4}>
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Payment Status:</strong>
                <br />
                <p>{order.isPaid ? 'Paid' : 'Not Paid'}</p>
                <br />
                <br />
                <strong>Payment Method:</strong>
                <br />
                <p>{order.paymentMethod}</p>
                <br />
                <br />
              </Card.Text>
            </Card.Body>
          </Col>
        </Row>
      </Card>
      <h3>Order item</h3>
      <Card className="mb-3">
        <div className="table-responsive-lg">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Item Price</th>
                <th>Total Item Price</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <tr key={item.slug}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price}</td>
                  <td>${item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tbody>
              <tr>
                <th>Subtotal</th>
                <th></th>
                <th></th>
                <th>${order.itemsPrice}</th>
              </tr>
            </tbody>
          </table>
        </div>
      </Card >
      <h3>Summary</h3>
      <Card className="mb-3">
        <div className="table-responsive-lg">
          <table className='table'>
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td class="text-end">${order.itemsPrice}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td class="text-end">${order.shippingPrice}</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <td>Taxes</td>
                <td class="text-end">${order.taxPrice.toFixed(2)}</td>
              </tr>
            </tbody>
            <tbody>
              <tr>
                <th>Total Price</th>
                <th class="text-end">${order.totalPrice.toFixed(2)}</th>
              </tr>
            </tbody>
          </table>
        </div>
      </Card >
    </div >
  );
}
