import axios from 'axios';
import * as EmailValidator from 'email-validator';
import { lettersOnly } from '../utils.js';
import { passwordCheck } from '../utils.js';
import * as fs from 'fs';

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

function validateSignUpFields(name, email, password, confirmPassword) {
  // validate name format
  if (!lettersOnly(name)) {
    return 'Invalid name format!';
  }
  // validate email format
  if (!EmailValidator.validate(email)) {
    return 'Invalid email format!';
  }

  // validate password syntax
  if (!passwordCheck(password)) {
    return 'Invalid password1 format!';
  }

  // validate both password match
  if (!(password === confirmPassword)) {
    return 'Invalid password2 format!';
  }

  var commonPwds = fs.readFileSync('10k-most-common.txt', 'utf8').toString().split(/\r?\n/);

  if (commonPwds.includes(password)) {
    return 'Common password entered! For security reasons please use another password.';
  }

  return 'valid';
}

export default { verifyCaptcha, validateSignUpFields };
