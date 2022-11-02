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

// validate email format
function validateEmail(email) {
  if (!EmailValidator.validate(email)) {
    return 'Invalid email format!';
  }
}

function validateUpdateProfileFields(name, email, oldPassword, newPassword) {
  // validate name format
  if (!lettersOnly(name)) {
    return 'Invalid name format!';
  }
  // validate email format
  if (!EmailValidator.validate(email)) {
    return 'Invalid email format!';
  }

  // validate password syntax
  if (!passwordCheck(oldPassword)) {
    return 'Invalid oldpassword format!';
  }

  // validate password syntax
  if (!passwordCheck(newPassword)) {
    return 'Invalid newPassword format!';
  }

  if (commonPwds.includes(newPassword)) {
    return 'Common password entered! For security reasons please use another password.';
  }

  return 'valid';
}

export default { validateEmail, validateUpdateProfileFields };
