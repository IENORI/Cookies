import { useEffect, useReducer } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
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

  const backgroundImage = {
    "backgroundImage": "url('../mae-mu-ZjVPaveuZNo-unsplash.png')",
    "height": "400px"
  };

  return (
    <div>
      <Helmet>
        <title>Cookies!</title>
      </Helmet>
      <header>
        <div className="container rounded-3 d-flex align-items-center justify-content-center" style={backgroundImage}>
          <div className="row">
            <figure class="text-end">
              <blockquote class="blockquote">
                <div className="text-center text-white display-5">
                  The absolute <strong>BEST</strong> cookies in town!
                </div>
              </blockquote>
              <figcaption class="blockquote-footer text-white">
                trust me bro
              </figcaption>
            </figure>
          </div>
        </div>
      </header>
      <hr/>
      <div className="mb-3 container d-flex justify-content-center">
        <div className="col col-xl-8">
          <Form.Group className="mb-3 mt-3 input-group shadow-sm" controlId="email">
            <span className="input-group-text" id="searchTag">&#128269; &#127850;</span>
            <Form.Control
              type="email"
              placeholder="Find a cookie"
              required
              onChange={submitHandler}
            />
          </Form.Group>
        </div>
      </div>
      <div className="products w-100" id="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <div>{error}</div>
        ) : (
          <Container className="px-0">
            <Row className="justify-content-center">
              {products.map((product) => (
                <Col key={product.slug} md={6} lg={5} xxl={4} className="mb-4">
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
