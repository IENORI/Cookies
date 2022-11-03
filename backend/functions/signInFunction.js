import axios from 'axios';
import User from '../models/userModel.js';
import bcrypt from "bcryptjs";
import * as EmailValidator from 'email-validator';
import { passwordCheck } from '../utils.js';

//verify captcha token
async function verifyCaptcha(token) {
  //sends secret key and response token to google
  try {
    let result = await axios({
      method: 'post',
      url: 'https://www.google.com/recaptcha/api/siteverify',
      params: {
        secret: process.env.CAPTCHA_SECRET_KEY,
        response: token,
      },
    });
    let data = result.data || {};
    if (!data.success) {
      throw {
        success: false,
        error: 'response not valid',
      };
    } else {
      return 'Captcha Success';
    }
  } catch (err) {
    return 'Captcha Error'; //401 is unauthorized
  }
}

function validateSignInFields(email, password) {
    // validate email format
    if (!EmailValidator.validate(email)) {
      return 'Invalid Email Format!';
    }
  
    // validate password syntax
    if (!passwordCheck(password)) {
      return 'Invalid Password Format!';
    }

    return 'valid';
  }
  

// check if user email and password is in db
async function validEmailPassword(email, password) {
  const user = await User.findOne({ email: email }); //return document found
  if (user) {
    //if user exist
    if (bcrypt.compareSync(password, user.password)) {
      return user;
    }
  }
  return null;
}
export default { verifyCaptcha, validateSignInFields, validEmailPassword };
