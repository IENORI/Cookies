import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Card from "react-bootstrap/Card";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderHistoryScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/orders/mine`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        console.log(data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: 'An error has occured while loading your orders, please try again later.' });
      }
    };
    fetchData();
  }, [userInfo]);
  return (
    <div>
      <Helmet>
        <title>Order History</title>
      </Helmet>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/">Home</a></li>
          <li class="breadcrumb-item active" aria-current="page">Order History</li>
        </ol>
      </nav>
      <h1>Order History</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <Card>
          <Card.Body class="table-responsive">
          <table className="table table-striped">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td><code>{order._id}</code></td>
                  <td><span className="font-monospace">{order.createdAt.substring(0, 10)}</span></td>
                  <td>$<code><b>{order.totalPrice.toFixed(2)}</b></code></td>
                  <td>
                    {order.isPaid
                      ?
                      <div><span className="badge bg-success">Yes</span><br/><span className="badge bg-secondary text-wrap">{order.updatedAt.toString().substring(0, 10)}</span></div>
                      : 
                      <span className="badge bg-danger">No</span>
                    }
                  </td>
                  <td>
                    {order.isDelivered
                      ?
                      <div><span className="badge bg-success">Yes</span><br/><span className="badge bg-secondary text-wrap">{order.updatedAt.toString().substring(0, 10)}</span></div>
                      :
                      <span className="badge bg-danger">No</span>
                    }
                  </td>
                  <td>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        navigate(`/order/${order._id}`);
                      }}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
