import { passwordCheck } from '../utils.js';
import * as fs from 'fs'; 

function validatePasswordUpdateFields(oldPassword, newPassword) {

  // validate password syntax
  if (!passwordCheck(oldPassword)) {
    return 'Invalid oldpassword format!';
  }

  // validate password syntax
  if (!passwordCheck(newPassword)) {
    return 'Invalid newPassword format!';
  }

  const commonPwds = fs.readFileSync('10k-most-common.txt', 'utf8').toString().split(/\r?\n/);

  if (commonPwds.includes(newPassword)) {
    return 'Common password entered! For security reasons please use another password.';
  }

  return 'valid';
}

export default { validatePasswordUpdateFields };