import React, { useContext, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { getError } from '../utils';
import { Store } from '../Store';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function OrderManageScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { orders } = state;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/orders/orders`, {});
        ctxDispatch({ type: 'FILL_ORDERS', payload: data });
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [ctxDispatch]);

  const deleteOrderHandler = async (orderId) => {
    const { data } = await axios.delete(`/api/orders/delete/${orderId}`);
    if (data === 'order deleted') {
      ctxDispatch({
        type: 'DELETE_ORDERS',
        payload: orders.filter((order) => {
          return order._id !== orderId;
        }),
      });
    }
    toast.success(data);
    return;
  };

  return (
    <div>
      <Helmet>
        <title>Order Management</title>
      </Helmet>

      <h1>Order Management</h1>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div className="table-responsive-lg">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>DELIVERED</th>
                <th>ORDER BY</th>
                <th>PURCHASED</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>ACTIONS</th>
                <th>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    {order.isDelivered
                      ? order.updatedAt.substring(0, 10)
                      : 'No'}
                  </td>
                  <td>{order.shippingAddress.fullName.toString()}</td>
                  <td>{order.orderItems.length.toString()} items</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>
                    <Button
                      type="button"
                      variant="success"
                      onClick={() => {
                        navigate(`/admin/orderlist/${order._id}`);
                      }}
                    >
                      Details
                    </Button>
                  </td>
                  <td>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => deleteOrderHandler(order._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
