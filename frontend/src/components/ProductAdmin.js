import Button from 'react-bootstrap/Button';
import { useContext, useState } from 'react';
import { Store } from '../Store';
import axios from 'axios';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { getError } from '../utils';

function ProductAdmin(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { products, userInfo } = state;

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(product.countInStock);
  const [description, setDescription] = useState(product.description);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/products/update/${product._id}`,
        {
          name,
          price,
          quantity,
          description,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      ctxDispatch({ type: 'UPDATE_PRODUCT', payload: data });
      toast.success('Product Updated successfully');
    } catch (err) {
      toast.error(getError(err));
    }
    handleClose();
  };

  const deleteProductHandler = async (productId) => {
    const { data } = await axios.delete(`/api/products/delete/${productId}`, {
      headers: { authorization: `Bearer ${userInfo.token}` },
    });
    if (data === 'product deleted') {
      ctxDispatch({
        type: 'DELETE_PRODUCT',
        payload: products.filter((product) => {
          return product._id !== productId;
        }),
      });
      handleClose();
    }
    toast.success(data);
    return;
  };

  return (
    <ListGroup as="ol">
      <ListGroup.Item className="d-flex justify-content-between align-items-start">
        <div>
          <img
            src={product.image}
            className="card-img-top"
            alt={product.name}
            height="100px"
          />
        </div>
        <div className="ms-2 me-auto">
          <div className="fw-bold">{product.name}</div>
          <div className="fw-normal">{product.name}</div>
          <div className="fw-light">Quantity: {product.countInStock}</div>
        </div>
        <div className="ms-2">
          <div className="fw-bold">${product.price}</div>
        </div>
        <Button
          variant="dark"
          className="position-absolute bottom-0 end-0"
          onClick={handleShow}
        >
          Edit
        </Button>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  autoFocus
                  placeholder="name"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={price}
                  placeholder="price"
                  required
                  onChange={(e) => setPrice(e.target.value)}
                  step="0.01"
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea2"
              >
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={quantity}
                  min="0"
                  placeholder="quantity"
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </Form.Group>
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
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              onClick={() => deleteProductHandler(product._id)}
            >
              Delete
            </Button>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" onClick={submitHandler}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </ListGroup.Item>
    </ListGroup>
  );
}
export default ProductAdmin;
