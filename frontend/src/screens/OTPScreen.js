import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { getError } from '../utils';

export default function OTPScreen() {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const { dispatch: ctxDispatch } = useContext(Store); //to use the context that was already defined
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
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/'); //redirect home screen
    } catch (err) {
      toast.error(getError(err));
    }
  };
  return (
    <>
      <div className="row">
        <div className="col text-center">
          <h1>Enter the OTP code</h1>
          <p>Sent to {validUser.email}</p>

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

          <p>OTP Entered - {otp.join('')}</p>
          <u onClick={sendCodeHandler}>Resend OTP Code</u>
          <p>
            <button
              className="btn btn-secondary mr-2"
              onClick={(e) => setOtp([...otp.map((v) => '')])}
            >
              Clear
            </button>
            <button className="btn btn-primary" onClick={verifyHandler}>
              Verify OTP
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
