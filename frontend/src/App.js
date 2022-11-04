import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import NavBar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import NavDropDown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useReducer } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import NavbarToggle from 'react-bootstrap/esm/NavbarToggle';
import NavbarCollapse from 'react-bootstrap/esm/NavbarCollapse';
import ProfileScreen from './screens/ProfileScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import OrderManageScreen from './screens/OrderManageScreen';
import OrderAdminScreen from './screens/OrderAdminScreen';
import UserListScreen from './screens/UserListScreen';
import OTPScreen from './screens/OTPScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import AutoLogout from './components/AutoLogout';
import CheckDeviceLogin from './components/CheckDeviceLogin';
import axios from 'axios';
import LoadingBox from './components/LoadingBox';
import MessageBox from './components/MessageBox';
import PasswordResetScreen from './screens/PasswordResetScreen';
import LogScreen from './screens/LogScreen';

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

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    dispatch({ type: 'FETCH_REQUEST' });
    if (userInfo == null) {
      dispatch({ type: 'FETCH_SUCCESS' });
    } else {
      const fetchData = async () => {
        try {
          const result = await axios.get(
            `/api/users/finduser/${userInfo._id}`,
            {
              headers: { authorization: `Bearer ${userInfo.token}` },
            }
          );
          userInfo.isAdmin = result.data.isAdmin;
          ctxDispatch({ type: 'USER_SIGNIN', payload: userInfo }); //payload that is passed along with action
          dispatch({ type: 'FETCH_SUCCESS' });
        } catch (err) {
          dispatch({ type: 'FETCH_FAIL', payload: err.message });
        }
      };
      fetchData();
    }
  }, [ctxDispatch, userInfo]);

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin'; //redirect user back to sign in screen, else it will crash lol
  };
  return (
    <div>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <BrowserRouter>
          {userInfo ? <CheckDeviceLogin></CheckDeviceLogin> : null}{' '}
          {/*Create check device login component when user is logged in*/}
          {userInfo ? <AutoLogout></AutoLogout> : null}{' '}
          {/*Create auto logout component when user is logged in*/}
          <div className="d-flex flex-column site-container">
            <ToastContainer position="bottom-center" limit={1} />
            <header>
              <NavBar bg="dark" variant="dark" expand="lg">
                <Container>
                  {!userInfo ? (
                    <LinkContainer to="/">
                      <NavBar.Brand>Cookies</NavBar.Brand>
                    </LinkContainer>
                  ) : userInfo.isAdmin ? (
                    <LinkContainer to="/admin/productlist">
                      <NavBar.Brand>Cookies</NavBar.Brand>
                    </LinkContainer>
                  ) : (
                    <LinkContainer to="/">
                      <NavBar.Brand>Cookies</NavBar.Brand>
                    </LinkContainer>
                  )}
                  <NavbarToggle ariacontrols="basic-navbar-nav" />
                  <NavbarCollapse id="basic-navbar-nav">
                    <Nav className="me-auto w-100 justify-content-end">
                      {!userInfo ? (
                        <Link to="/cart" className="nav-link">
                          Cart
                          {cart.cartItems.length > 0 && (
                            <Badge pill bg="danger">
                              {cart.cartItems.reduce(
                                (a, c) => a + c.quantity,
                                0
                              )}
                            </Badge>
                          )}
                        </Link>
                      ) : !userInfo.isAdmin ? (
                        <Link to="/cart" className="nav-link">
                          Cart
                          {cart.cartItems.length > 0 && (
                            <Badge pill bg="danger">
                              {cart.cartItems.reduce(
                                (a, c) => a + c.quantity,
                                0
                              )}
                            </Badge>
                          )}
                        </Link>
                      ) : null}
                      {userInfo ? (
                        <NavDropDown
                          title={userInfo.name}
                          id="basic-nav-dropdown"
                        >
                          <LinkContainer to="/profile">
                            <NavDropDown.Item>User Profile</NavDropDown.Item>
                          </LinkContainer>
                          {!userInfo.isAdmin ? (
                            <LinkContainer to="/orderhistory">
                              <NavDropDown.Item>Order History</NavDropDown.Item>
                            </LinkContainer>
                          ) : null}
                          <NavDropDown.Divider />
                          <Link
                            to="#signout"
                            className="dropdown-item"
                            onClick={signoutHandler}
                          >
                            Sign Out
                          </Link>
                        </NavDropDown>
                      ) : (
                        <Link to="/signin" className="nav-link">
                          Sign In{' '}
                        </Link>
                      )}
                      {userInfo && userInfo.isAdmin && (
                        <NavDropDown title="Admin" id="admin-nav-dropdown">
                          <LinkContainer to="/admin/productlist">
                            <NavDropDown.Item>Products</NavDropDown.Item>
                          </LinkContainer>
                          <LinkContainer to="/admin/orderlist">
                            <NavDropDown.Item>Orders</NavDropDown.Item>
                          </LinkContainer>
                          <LinkContainer to="/admin/userlist">
                            <NavDropDown.Item>Users</NavDropDown.Item>
                          </LinkContainer>
                          <LinkContainer to="/admin/loglist">
                            <NavDropDown.Item>Logs</NavDropDown.Item>
                          </LinkContainer>
                        </NavDropDown>
                      )}
                    </Nav>
                  </NavbarCollapse>
                </Container>
              </NavBar>
            </header>
            <main>
              <Container className="mt-3">
                {!userInfo ? ( // guest that are not logged in
                  <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/cart" element={<CartScreen />} />
                    <Route path="/signin" element={<SigninScreen />} />
                    <Route path="/verify" element={<OTPScreen />} />
                    <Route
                      path="/forgotpassword"
                      element={<ForgotPasswordScreen />}
                    />
                    <Route path="/passwordReset" element={<PasswordResetScreen />} />
                    <Route path="/product/:slug" element={<ProductScreen />} />
                    <Route path="/signup" element={<SignupScreen />} />
                  </Routes>
                ) : userInfo && userInfo.isAdmin ? ( // logged in admin
                  <Routes>
                    <Route path="/profile" element={<ProfileScreen />} />
                    {/* Admin Routes */}
                    <Route
                      path="/admin/productlist"
                      element={
                        <AdminRoute>
                          <ProductListScreen />
                        </AdminRoute>
                      }
                    ></Route>
                    <Route
                      path="/admin/orderlist"
                      element={
                        <AdminRoute>
                          <OrderManageScreen />
                        </AdminRoute>
                      }
                    ></Route>
                    <Route
                      path="/admin/orderlist/:id"
                      element={
                        <AdminRoute>
                          <OrderAdminScreen />
                        </AdminRoute>
                      }
                    ></Route>
                    <Route
                      path="/admin/userlist"
                      element={
                        <AdminRoute>
                          <UserListScreen />
                        </AdminRoute>
                      }
                    ></Route>
                    <Route
                      path="/admin/loglist"
                      element={
                        <AdminRoute>
                          <LogScreen />
                        </AdminRoute> 
                      }
                    ></Route>
                  </Routes>
                ) : userInfo && !userInfo.isAdmin ? ( // logged in normal user
                  <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/cart" element={<CartScreen />} />
                    <Route path="/product/:slug" element={<ProductScreen />} />
                    <Route
                      path="/shipping"
                      element={<ShippingAddressScreen />}
                    />
                    <Route path="/payment" element={<PaymentMethodScreen />} />
                    <Route path="/placeorder" element={<PlaceOrderScreen />} />
                    <Route path="/order/:id" element={<OrderScreen />} />
                    <Route
                      path="/orderhistory"
                      element={<OrderHistoryScreen />}
                    />
                    <Route path="/profile" element={<ProfileScreen />} />
                  </Routes>
                ) : null}
              </Container>
            </main>
            <footer>
              <div className="text-center">All rights reserved</div>
            </footer>
          </div>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
