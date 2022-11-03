import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';

export default function OTPScreen() {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const { dispatch: ctxDispatch } = useContext(Store); //to use the context that was already defined
  const [counter, setCounter] = useState(10);
  const navigate = useNavigate();

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    //Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const validUser = JSON.parse(localStorage.getItem('validUserIdEmail'));

  const sendCodeHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    try {
        const { data } = await axios.post('/api/users/resendcode', {
          userId: validUser._id,
        });
        // toast resend code success
        toast.success(data);
        setCounter(30); // start counting down from 30 for every seconds
      } catch (err) {
        toast.error(getError(err));
      }
  };

  const verifyHandler = async (e) => {
    e.preventDefault(); //prevents page from refreshing
    const otpCode = otp.join('');
    try {
      const { data } = await axios.post('/api/users/verify', {
        token: otpCode,
        userId: validUser._id,
      });
      //after successful verification
      ctxDispatch({ type: 'USER_SIGNIN', payload: data }); //payload that is passed along with action
      const isUserAdmin = data['isAdmin'];
      delete data['isAdmin'];
      localStorage.setItem('userInfo', JSON.stringify(data));
      if (isUserAdmin === true){
        window.location.href = '/admin/productlist'
        //navigate('/admin/productlist'); //redirect home screen
      }else{
        window.location.href = '/'
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  // if counter > 0 keep counting down every 1 sec interval
  useEffect(() => {
    if (counter > 0){
      const timer = setInterval(() => setCounter(counter - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [counter]);

  return (
    <div className="container">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
      <div className="row">
        <div className="col text-center">
          <h1>Enter the OTP Code</h1>
          <br/>
          <p>Sent to <code>{validUser.email}</code></p>
          <div className="d-flex justify-content-center align-items-center">
            {otp.map((data, index) => {
              return (
                <input
                  className="otp-field"
                  type="text"
                  name="otp"
                  maxLength="1"
                  key={index}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              );
            })}
            <button
              className="btn btn-light"
              type="button"
              onClick={(e) => setOtp([...otp.map((v) => '')])}
            >
            <span className="pb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-backspace" viewBox="0 0 16 16">
                <path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z"/>
                <path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z"/>
              </svg>
            </span>
          </button>
          </div>
          <br/>
          <button className="btn btn-primary" onClick={verifyHandler}>
            Verify OTP
          </button>
          <br/>
          <p className="mt-5">Didn't receive the OTP?</p>
          {counter > 0 ? (<button type="button" className="btn btn-light disabled">Resend in <span>{counter}</span></button>) : (<button type="button" className="btn btn-warning" onClick={sendCodeHandler}>Resend OTP Code</button>)}
        </div>
      </div>
    </div>
  );
}
