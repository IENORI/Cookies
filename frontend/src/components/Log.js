import React, { useContext, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';

function Log(props) {

  const { log } = props;
  const statusCode = log.statusCode;
  const activity = log.activity;

  return (
    <div>
    <ListGroup as="ol">
      <ListGroup.Item className="d-flex justify-content-between align-items-start">
        <div className="ms-2 me-auto">
          <div className="fw-bold">{statusCode}</div>
          {activity}
        </div>
      </ListGroup.Item>
    </ListGroup>
    </div>
  );
}
export default Log; 
