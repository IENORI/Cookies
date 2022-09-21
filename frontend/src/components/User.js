import React, { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Store } from '../Store';
import axios from 'axios';
import { toast } from 'react-toastify';

function User(props) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userList } = state;

  const { user } = props;

  const deleteUserHandler = async (userId) => {
    const { data } = await axios.delete(`/api/users/deleteuser/${userId}`);
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

  return (
    <ListGroup as="ol">
      <ListGroup.Item className="d-flex justify-content-between align-items-start">
        <div className="ms-2 me-auto">
          <div className="fw-bold">{user.name}</div>
          {user.email}
        </div>
        <Button variant="light" onClick={() => deleteUserHandler(user._id)}>
          <i className="fas fa-trash"></i>
        </Button>
      </ListGroup.Item>
    </ListGroup>
  );
}
export default User;
