//context for storing cart data
import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  cart: {
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : '',
  },
  userList: [],
  products: [],
  orders: [],
  logs: [],
};
function reducer(state, action) {
  switch (action.type) {
    case 'CART_ADD_ITEM':
      const newItem = action.payload; //save the item we are going to add into this var first
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem //to add existing item into cart
        ? state.cart.cartItems.map((item) =>
          item._id === existItem._id ? newItem : item
        )
        : [...state.cart.cartItems, newItem]; //otherwise just add the new item into cart if does not exist
      localStorage.setItem('cartItems', JSON.stringify(cartItems)); //key, value ; to save in local storage so can refresh
      return { ...state, cart: { ...state.cart, cartItems } };
    case 'CART_REMOVE_ITEM': {
      //filter to completely remove the item
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('cartItems', JSON.stringify(cartItems)); //key, value ; to save in local storage so can refresh
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_CLEAR':
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    case 'USER_SIGNIN':
      return { ...state, userInfo: action.payload }; // put into state
    case 'USER_SIGNOUT':
      return {
        ...state,
        userInfo: null,
        cart: { cartItems: [], shippingAddress: {}, paymentMethod: '' },
      }; //put into state
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: { ...state.cart, shippingAddress: action.payload },
      };
    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    case 'DELETE_USER':
      return {
        ...state,
        userList: action.payload,
      };
    case 'FILL_USER':
      return {
        ...state,
        userList: action.payload,
      };
    case 'FILL_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: action.payload,
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: action.payload,
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: action.payload,
      };
    case 'FILL_ORDERS':
      return {
        ...state,
        orders: action.payload,
      };
    case 'DELETE_ORDERS':
      return {
        ...state,
        orders: action.payload,
      };
    case 'FILL_LOGS':
      return {
        ...state,
        logs: action.payload,
      }
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
