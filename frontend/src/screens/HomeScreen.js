import { useEffect, useReducer } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import Container from 'react-bootstrap/Container';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, initial_products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'FILTER_PRODUCTS':
      return { ...state, products: action.payload, loading: false };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, error, products, initial_products }, dispatch] = useReducer(reducer, {
    products: [],
    initial_products: [],
    loading: true,
    error: '',
  });

  const submitHandler = async (e) => {
    const { value } = e.target;
    const data_filter = initial_products.filter((element) =>
      element.name.toLowerCase().includes(value.toLowerCase())
    );
    dispatch({ type: 'FILTER_PRODUCTS', payload: data_filter });
  };

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: 'An error has occured while loading products, please try again later.' });
      }
    };
    fetchData();
  }, []);
  return (
    <div>
      <Helmet>
        <title>Cookies!</title>
      </Helmet>
      <h1>Featured Cookies!</h1>
      <input
        type="text"
        id="searchInput"
        placeholder="Search.."
        onChange={submitHandler}
      />
      <div className="products w-100" id="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <div>{error}</div>
        ) : (
          <Container className="px-0">
            <Row>
              {products.map((product) => (
                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                  <Product product={product} />
                </Col>
              ))}
            </Row>
          </Container>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
