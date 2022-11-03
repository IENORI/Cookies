import * as EmailValidator from 'email-validator';
import { lettersOnly } from '../utils.js';
import { passwordCheck } from '../utils.js';
import * as fs from 'fs'; 

let commonPwds;

fs.readFile('10k-most-common.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  commonPwds = data.toString().split(/\r?\n/);
});

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

  if (commonPwds.includes(password)) {
    return 'Common password entered! For security reasons please use another password.';
  }

  return "valid";
}

export default { validateSignUpFields };