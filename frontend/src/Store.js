//context for storing cart data
import { createContext, useReducer } from "react";

export const Store = createContext();

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  cart: {
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
  },
};
function reducer(state, action) {
  switch (action.type) {
    case "CART_ADD_ITEM":
      const newItem = action.payload; //save the item we are going to add into this var first
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem //to add existing item into cart
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem]; //otherwise just add the new item into cart if does not exist
      localStorage.setItem("cartItems", JSON.stringify(cartItems)); //key, value ; to save in local storage so can refresh
      return { ...state, cart: { ...state.cart, cartItems } };
    case "CART_REMOVE_ITEM": {
      //filter to completely remove the item
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem("cartItem", JSON.stringify(cartItems)); //key, value ; to save in local storage so can refresh
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "USER_SIGNIN":
      return { ...state, userInfo: action.payload }; // put into state
    case "USER_SIGNOUT":
      return { ...state, userInfo: null }; //put into state
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
