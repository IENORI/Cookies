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
    const imagePath = "https://3x03-cookies.sgp1.digitaloceanspaces.com/default.png";
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
            'authorization': `Bearer ${userInfo.token}`
          },
        },
      );
      ctxDispatch({ type: 'ADD_PRODUCT', payload: data });
      handleClose();
    } catch (err) {
      toast.error('Failed to create listing');
    }
  };
  return (
    <div>
      <Helmet>
        <title>Product List</title>
      </Helmet>
      <h1>Product List</h1>
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
            <Form onSubmit={submitHandler}>
              <Row>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    autoFocus
                    placeholder="Cookie Name"
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Row>
              <Row>
                <Col xs={6} md={6}>
                  <Row>
                    <Form.Group
                      className="mb-3">
                      <Form.Label>Image</Form.Label>
                      <Form.Control
                        required
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                      />
                    </Form.Group>
                  </Row>
                  <Row>
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Price</Form.Label>
                      <div class="input-group">
                        <span class="input-group-text">$</span>
                        <Form.Control
                          type="number"
                          value={price}
                          min="0.00"
                          step="0.01"
                          autoFocus
                          placeholder="Cost Per Unit"
                          onChange={(e) => setPrice(e.target.value)}
                          required
                        />
                      </div>
                    </Form.Group>
                  </Row>
                  <Row>
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        value={quantity}
                        min="1"
                        autoFocus
                        placeholder="Available Quantity"
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Row>
                </Col>
                <Col xs={6} md={6}>
                  <Row>
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
                  </Row>
                  <Row>
                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlTextarea1"
                    >
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        value={description}
                        placeholder="Description"
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        required
                      />
                    </Form.Group>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </Row>
            </Form>
          </Container>
        </Modal.Body>
      </Modal>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={12} md={12} lg={12} className="mb-3">
                <ProductAdmin product={product}></ProductAdmin>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
