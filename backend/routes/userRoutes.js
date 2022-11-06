import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { isAuth, generateToken } from '../utils.js';
import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';
import dotenv from 'dotenv';
import { v1 as uuid } from 'uuid';
import ratelimit from 'express-rate-limit';
import Token from '../models/tokenModel.js';
import crypto from 'crypto';
import { lettersOnly } from '../utils.js';
import { passwordCheck } from '../utils.js';
import signInFunction from '../functions/signInFunction.js';
import signUpFunction from '../functions/signUpFunction.js';
import updateProfileFunction from '../functions/updateProfileFunction.js';
import forgotPasswordFunction from '../functions/forgotPasswordFunction.js';
import Log from '../models/logModel.js';
import * as EmailValidator from 'email-validator';

dotenv.config(); //to fetch variables

const userRouter = express.Router();
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'noreplycookie3x03@gmail.com',
    pass: process.env.GOOGLE_APP_PASS,
  },
});

// for storing mail options
var mailOptions = {
  to: '',
  subject: '',
  html: ``,
};

// prevent password brute force
const loginlimiter = ratelimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // limit each IP to 5 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  statusCode: 401,
  message: {
    limiter: true,
    type: 'error',
    message: 'Too many requests, please try again later.',
  },
});

userRouter.get('/', isAuth, async (req, res) => {
  if (req.user.isAdmin) {
    const users = await User.find({ isAdmin: false });
    res.send(users);
  } else {
    res.status(404).send({ message: 'UNAUTHORIZED ACCESS' });
  }
});

//sign in
userRouter.post(
  '/signin',
  loginlimiter,
  expressAsyncHandler(async (req, res) => {
    //Destructuring response token from request body
    const token = req.body.token;
    //sends secret key and response token to google
    const captchaResult = await signInFunction.verifyCaptcha(token);

    const captchaLog = new Log({
      statusCode: '422',
      activity: 'Captcha Error',
    });

    const validFLog = new Log({
      statusCode: '400',
      activity: 'Invalid Email/Password',
    });

    if (captchaResult === 'Captcha Error') {
      res.status(401).send({ message: captchaResult }); //401 is unauthorized
      await captchaLog.save();
      return;
    }

    // validate email and password fields
    const validFields = signInFunction.validateSignInFields(
      req.body.email,
      req.body.password
    );
    if (validFields != 'valid') {
      res.status(400).send({ message: validFields });
      await validFLog.save();
      return;
    }

    const user = await signInFunction.validEmailPassword(
      req.body.email,
      req.body.password
    );
    if (user != null) {
      //if user exist
      // generate otp
      const secret = speakeasy.generateSecret({ length: 20 });
      const temp_otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        algorithm: 'sha256',
      });
      // save temp_otp to user's temp_secret in database
      user.temp_secret = secret.base32;
      await user.save();
      mailOptions['to'] = user.email;
      mailOptions['subject'] = 'Verification code';
      mailOptions['html'] = `<h1>Your verification code is: ${temp_otp}</h1>`;
      // send email to user
      try {
        const response = await transporter.sendMail(mailOptions);
      } catch (error) {
        //Handle error in event of malformed email, email service down etc.
        res.status(500).send({
          message: 'Unable to send verification code, please try again later',
        }); //500 is internal server error
        return;
      }
      //compare password
      res.send({
        _id: user._id,
        email: user.email,
      });
      return; //no need to continue after this
    }
    res.status(401).send({ message: 'Invalid email or password' }); //401 is unauthorized
    await validFLog.save();
  })
);

//sign up
userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const token = req.body.token;
    //sends secret key and response token to google
    const captchaResult = await signUpFunction.verifyCaptcha(token);

    if (captchaResult === 'Captcha Error') {
      res.status(401).send({ message: captchaResult }); //401 is unauthorized
      await captchaLog.save();
      return;
    }

    // validate input fields
    const validFields = signUpFunction.validateSignUpFields(
      req.body.name,
      req.body.email,
      req.body.password,
      req.body.confirmPassword
    );
    if (validFields != 'valid') {
      res.status(400).send({ message: validFields });
      return;
    }

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    const loginId = uuid(); // generate unique login id
    // saving generated login id to database
    newUser.login_id = loginId;

    const user = await newUser.save(); //save to database

    const signUpLog = new Log({
      user: user._id,
      statusCode: '200',
      activity: 'New User Created.',
    });
    await signUpLog.save();
    //then send the response back to front end
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
      login_id: loginId, // generate unique id
    });
  })
);

userRouter.get('/finduser/:id', isAuth, async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (user) {
    res.send({
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404).send({ message: 'User not found' });
  }
});

//delete user
userRouter.delete(
  '/deleteuser/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const user = await User.findByIdAndRemove(id).exec();
    const deleteUserLog = new Log({
      user: req.user._id,
      isAdmin: req.user.isAdmin,
      statusCode: '200',
      activity: 'Admin deleted Account: ' + user._id,
    });
    res.send('User Deleted');
    await deleteUserLog.save();
    return;
  })
);

//resend code
userRouter.post(
  '/resendcode',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.userId);
    if (user) {
      // generate otp
      const secret = speakeasy.generateSecret({ length: 20 });
      const temp_otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        algorithm: 'sha256',
      });
      // save temp_otp to user's temp_secret in database
      user.temp_secret = secret.base32;
      await user.save();
      mailOptions['to'] = user.email;
      mailOptions['subject'] = 'Verification code';
      mailOptions['html'] = `<h1>Your verification code is: ${temp_otp}</h1>`;
      // send email to user
      try {
        const response = await transporter.sendMail(mailOptions);
      } catch (error) {
        //Handle error in event of malformed email, email service down etc.
        console.log('Error sending OTP: ' + error);
        res.status(500).send({
          message: 'Unable to resend verification code, please try again later',
        }); //500 is internal server error
        return;
      }
      res.send('Code resend');
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

//verify
userRouter.post(
  '/verify',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.userId);
    const temp_otp = req.body.token;

    const signInLog = new Log({
      user: user._id,
      isAdmin: user.isAdmin,
      statusCode: '200',
      activity: 'User Successfully Logged In',
    });

    const signInFLog = new Log({
      user: user._id,
      isAdmin: user.isAdmin,
      statusCode: '404',
      activity: 'User Failed To Key In Correct OTP',
    });

    if (user) {
      const stored_secret = user.temp_secret;
      // Verify a given token
      var validToken = speakeasy.totp.verify({
        secret: stored_secret,
        encoding: 'base32',
        algorithm: 'sha256',
        token: temp_otp,
        window: 1, // default is 1 = 30seconds, increase window by 1 = adding 30 seconds grace time from time code was generated
      });
      if (validToken) {
        // verification succeeded
        const loginId = uuid(); // generate unique login id
        // saving generated login id to database
        user.login_id = loginId;

        await user.save();
        await signInLog.save();

        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
          login_id: loginId,
        });
      } else {
        res.status(404).send({ message: 'Wrong or expired code entered' });
        await signInFLog.save();
      }
    }
  })
);

//new password reset
userRouter.post(
  '/resetpassword',
  expressAsyncHandler(async (req, res) => {
    // validate email format
    const emailValidateResult = forgotPasswordFunction.validateEmail(
      req.body.email
    );
    if (emailValidateResult === 'Invalid email format!') {
      res.status(400).send({ message: emailValidateResult });
      return;
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = await Token.findOne({ userId: user._id });
      if (token) {
        await token.deleteOne();
      }
      const resetToken = crypto.randomBytes(32).toString('hex'); // generate random reset token using crypto api
      const hashedToken = await bcrypt.hash(resetToken, 10); // hash the generated token for saving to db with salt of 10
      await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
      }).save();

      // save new password generated to database
      const clientURL = 'https://cookies.gg3z.xyz';
      const link = `${clientURL}/passwordReset?token=${resetToken}&id=${user._id}`;
      mailOptions['to'] = user.email;
      mailOptions['subject'] = 'Password reset';
      mailOptions[
        'html'
      ] = `<h1>Please click the link to reset your password:${link}</h1>`;
      // send email to user
      try {
        const response = await transporter.sendMail(mailOptions);
      } catch (error) {
        //Handle error in event of malformed email, email service down etc.
        res.status(500).send({
          message: 'Unable to send reset password link, please try again later',
        }); //500 is internal server error
        return;
      }
      res.send(`Password reset request have been sent to ${user.email}`);
    } else {
      //Email doesn't exist, but showing same result to prevent others from checking which email has an account
      res.send(`Password reset request have been sent to ${req.body.email}`);
    }
  })
);

//verify password reset
userRouter.post(
  '/verifyreset',
  expressAsyncHandler(async (req, res) => {
    const passwordResetToken = await Token.findOne({ userId: req.body.userId });
    if (!passwordResetToken) {
      res
        .status(404)
        .send({ message: 'Invalid or expired password reset token' });
    }
    const isValid = await bcrypt.compare(
      req.body.token,
      passwordResetToken.token
    );
    if (!isValid) {
      res
        .status(404)
        .send({ message: 'Invalid or expired password reset token' });
    }
    const user = await User.findById(req.body.userId);
    const resetPasswordLog = new Log({
      user: user._id,
      isAdmin: user.isAdmin,
      statusCode: '200',
      activity: 'User Reset Password Successfully.',
    });

    if (user) {
      user.password = bcrypt.hashSync(req.body.password, 8); //8 is the salt
      await user.save();
      await resetPasswordLog.save();
      await passwordResetToken.deleteOne();
      res.send('Password reset successfully');
    } else {
      await passwordResetToken.deleteOne();
      res.status(404).send({ message: 'User not found' });
    }
  })
);

//check login id
userRouter.post(
  '/checkloginid',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.userId);
    if (user) {
      const login_id = req.body.loginId;
      if (login_id === user.login_id) {
        // if user's login id is different from saved login id in database
        res.send('No new login attempt');
      } else {
        res.status(404).send({
          message: 'Your account has been logged in on another device',
        });
      }
    } else {
      res.status(404).send({ message: 'Your account has been removed' });
    }
  })
);

//update details
userRouter.put(
  '/update/details/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const profileUpdateLog = new Log({
      user: user._id,
      isAdmin: user.isAdmin,
      statusCode: '200',
      activity: 'User Successfully Updated Profile',
    });
    const profileUpdateFLog = new Log({
      user: user._id,
      isAdmin: user.isAdmin,
      statusCode: '404',
      activity: 'User Failed To Update Profile',
    });

    if (
      user &&
      lettersOnly(req.body.name) &&
      EmailValidator.validate(req.body.email)
    ) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (bcrypt.compareSync(req.body.verifyPassword, user.password)) {
        await user.save();
        await profileUpdateLog.save();
        res.status(200).send();
      } else {
        res.status(404).send({ message: 'Update failed' });
        await profileUpdateFLog.save();
      }
    } else {
      res.status(404).send({ message: 'Update Failed' });
    }
  })
);

//update password
userRouter.put(
  '/update/password/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const passwordUpdateLog = new Log({
      user: user._id,
      isAdmin: user.isAdmin,
      statusCode: '200',
      activity: 'User Successfully Updated Password',
    });
    const passwordUpdateFLog = new Log({
      user: user._id,
      isAdmin: user.isAdmin,
      statusCode: '400',
      activity: 'User Failed To Update Password',
    });

    // validate password update fields
    const validFields = updateProfileFunction.validatePasswordUpdateFields(
      req.body.oldpassword,
      req.body.password
    );

    if (validFields != 'valid') {
      res.status(400).send({ message: validFields });
      await passwordUpdateFLog.save();
      return;
    }

    if (bcrypt.compareSync(req.body.oldpassword, user.password)) {
      user.password = bcrypt.hashSync(req.body.password, 8);
      await user.save();
      await passwordUpdateLog.save();
      res.status(200).send();
    } else {
      res.status(400).send();
      await passwordUpdateFLog.save();
    }
  })
);
export default userRouter;
