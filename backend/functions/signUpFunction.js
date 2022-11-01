import * as EmailValidator from 'email-validator';
import { lettersOnly } from '../utils.js';
import { passwordCheck } from '../utils.js';

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
  return "valid";
}

export default { validateSignUpFields };