import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Log from '../components/Log';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, logs: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function LogScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, logs }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  // console.log(logs)

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { result } = await axios.get('/api/test', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        ctxDispatch({ type: 'FILL_LOGS', payload: result.data });
        // dispatch({ type: 'FILL_LOGS'});
        // dispatch({ type: 'FETCH_SUCCESS'});
        dispatch({ type: 'FETCH_SUCCESS', payload: result });
        console.log(result)
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, [ctxDispatch]);
  return (
    <div>
      <Helmet>
        <title>Logs</title>
      </Helmet>
      <h1>All Logs</h1>
      <div>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {logs.map((log) => (
              <Col key={log.activity} sm={6} md={4} lg={12} className="mb-3">
                <Log log={log}></Log>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
