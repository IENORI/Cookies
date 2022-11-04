import ListGroup from 'react-bootstrap/ListGroup';

function Log(props) {

  const { log } = props;
  const statusCode = log.statusCode;
  const activity = log.activity;
  const user = log.user;
  const time = log.createdAt;
  var timestamp = new Date(time)

  return (
    <div>
    <ListGroup as="ol">
      <ListGroup.Item className="d-flex justify-content-between align-items-start">
        <div className="ms-2 me-auto">
          <div className="fw-bold">Status Code: {statusCode}</div>
          User: {user} &nbsp;
          Time: {timestamp.toLocaleString()} &nbsp; 
          Activity: {activity}
        </div>
      </ListGroup.Item>
    </ListGroup>
    </div>
  );
}
export default Log;  
