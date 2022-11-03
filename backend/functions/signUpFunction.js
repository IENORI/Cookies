import * as EmailValidator from 'email-validator';
import { lettersOnly } from '../utils.js';
import { passwordCheck } from '../utils.js';
import * as fs from 'fs'; 

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

  return "valid";
}

export default { validateSignUpFields };