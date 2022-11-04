import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";

function Product({ product }) {
  const { state, dispatch: cxtDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state; //take the cart items from the state
  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1; //set to one if doesn't exist in cart
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      toast.error("Sorry. Product is out of stock!");
      return;
    }
    cxtDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...item, quantity },
    });
  };
  return (
    <Card className="shadow-sm" key={product.slug}>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
      <div className="container">
          <div className="row">
            <Link to={`/product/${product.slug}`}>
              <Card.Title>{product.name}</Card.Title>
            </Link>
          </div>
          <div className="row mt-3">
            <div className="col d-flex align-items-center">
              <Card.Text>
                <h4 className="m-0 font-monospace">
                  ${product.price}
                </h4>
              </Card.Text>
            </div>
            <div className="col">
              {product.countInStock === 0 ? (
                <Button className="shadow-sm w-100 btn-light" disabled>
                  &#10060; Out of Stock
                </Button>
              ) : (
                <Button className="shadow-sm w-100 btn-light" onClick={() => addToCartHandler(product)}>
                  &#128722; Add to cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Product;
