import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProductAdmin from '../components/ProductAdmin';
import { Store } from '../Store';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
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

export default function ProductListScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { products, userInfo } = state;
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [description, setDescription] = useState('');

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const filterHandler = async (e) => {
    const { value } = e.target;
    try {
      const result = await axios.get('/api/products');
      ctxDispatch({ type: 'FILL_PRODUCTS', payload: result.data });
      dispatch({ type: 'FETCH_SUCCESS' });
      console.log(result.data);
      const data_filter = result.data.filter((element) =>
        element.name.toLowerCase().includes(value.toLowerCase())
      );
      ctxDispatch({ type: 'FILL_PRODUCTS', payload: data_filter });
      dispatch({ type: 'FETCH_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: err.message });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        ctxDispatch({ type: 'FILL_PRODUCTS', payload: result.data });
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, [ctxDispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const imagePath = '/images/' + imageFile.name.replace(/\s/g, '');
    try {
      const { data } = await axios.post(
        '/api/products/add',
        {
          imagePath,
          name,
          category,
          price,
          quantity,
          description,
          imageFile,
        },
        {
          headers: {
            'content-type': 'multipart/form-data',
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'ADD_PRODUCT', payload: data });
      handleClose();
    } catch (err) {
      toast.error('failed to upload');
    }
  };
  return (
    <div>
      <Helmet>
        <title>Product List</title>
      </Helmet>
      <h1>Product List</h1>
      <input type="text" placeholder="Search.." onInput={filterHandler} />
      <div className="mb-3 text-end">
        <Button variant="primary" onClick={handleShow}>
          Create
        </Button>
      </div>
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <Container>
            <Form>
              <Row>
                <Col xs={6} md={6}>
                  <Form.Label>Image</Form.Label>
                  <Form.Control
                    type="file"
                    className="h-50"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </Col>
                <Col xs={6} md={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={name}
                      autoFocus
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={6} md={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={category}
                      autoFocus
                      placeholder="Category"
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={6} md={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={price}
                      autoFocus
                      placeholder="Price"
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={6} md={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={quantity}
                      autoFocus
                      placeholder="Stock"
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={6} md={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                  >
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      value={description}
                      placeholder="description"
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={submitHandler}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Container>
            <Row>
              {products.map((product) => (
                <Col
                  key={product.slug}
                  sm={12}
                  md={12}
                  lg={12}
                  className="mb-3"
                >
                  <ProductAdmin product={product}></ProductAdmin>
                </Col>
              ))}
            </Row>
          </Container>
        )}
      </div>
    </div>
  );
}
