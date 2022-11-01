import * as EmailValidator from 'email-validator';

// validate email format
function validateEmail(email) {
  if (!EmailValidator.validate(email)) {
    return 'Invalid email format!';
  }
}

export default { validateEmail };
