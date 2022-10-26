import React, { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Store } from '../Store';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import { getError } from '../utils';

function User(props) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userList, userInfo } = state;

  const { user } = props;

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setName(user.name);
    setEmail(user.email);
    setShow(true);
  };

  const deleteUserHandler = async (userId) => {
    const { data } = await axios.delete(`/api/users/deleteuser/${userId}`, {
      headers: { authorization: `Bearer ${userInfo.token}` },
    });
    if (data === 'user deleted') {
      ctxDispatch({
        type: 'DELETE_USER',
        payload: userList.filter((user) => {
          return user._id !== userId;
        }),
      });
    }
    toast.success(data);
    return;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `/api/users/update/${user._id}`,
        {
          name,
          email,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      ctxDispatch({ type: 'FILL_USER', payload: data });
      toast.success('User Updated successfully');
    } catch (err) {
      toast.error(getError(err));
    }
    handleClose();
  };

  return (
    <ListGroup as="ol">
      <ListGroup.Item className="d-flex justify-content-between align-items-start">
        <div className="ms-2 me-auto">
          <div className="fw-bold">{user.name}</div>
          {user.email}
        </div>
        <Button variant="light" onClick={handleShow}>
          <i className="fas fa-edit"></i>
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
                <Form.Label>email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  placeholder="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit" onClick={submitHandler}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        <Button variant="light" onClick={() => deleteUserHandler(user._id)}>
          <i className="fas fa-trash"></i>
        </Button>
      </ListGroup.Item>
    </ListGroup>
  );
}
export default User;
