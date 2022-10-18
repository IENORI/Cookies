import axios from 'axios';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';

export default function CheckDeviceLogin({ children }) {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  let interval;

  const checkMultipleLogInHandler = async (e) => {
    try {
      const { data } = await axios.post('/api/users/checkloginid', {
        loginId: userInfo.login_id,
        userId: userInfo._id,
      });
      // do nothing if no multiple log in attempt
    } catch (err) {
        // if new login detected access do the following
      toast.error(getError(err));
      resetTimer();
      logoutAction();
    }
  };

  // this function sets the interval that check any new login every 3 secs
  const handleLogoutTimer = () => {
    interval = setInterval(() => {
      // logs out user
      checkMultipleLogInHandler();
    }, 3000); // 3000ms = 3secs. You can change the time.
  };

  // this resets the timer if it exists.
  const resetTimer = () => {
    if (interval) clearInterval(interval);
  };

  // when component mounts, start timer
  useEffect(() => {
    resetTimer();
    handleLogoutTimer();
  }, []);

  // logs out user by clearing out auth token in localStorage and redirecting url to /signin page.
  const logoutAction = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin'; //redirect user back to sign in screen
  };

  return children;
}
