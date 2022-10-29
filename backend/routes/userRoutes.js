import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { isAuth, generateToken } from '../utils.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';
import dotenv from 'dotenv';
import passwordgenerator from 'generate-password';
import { v1 as uuid } from 'uuid';
import ratelimit from 'express-rate-limit';
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
  subject: 'Verification code',
  html: `Error sending verification code, please try again later.`,
};

// prevent password brute force
const loginlimiter = ratelimit({
  windowMs: 10 * 60 * 100, // 10 minutes
  max: 3, // limit each IP to 5 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  statusCode: 401,
  message: {
    limiter: true,
    type: "error",
    message: "Too many requests, please try again later."
  }
})

userRouter.get('/', isAuth, async (req, res) => {
  const users = await User.find({ isAdmin: false });
  res.send(users);
});

userRouter.post(
  '/signin', loginlimiter,
  expressAsyncHandler(async (req, res) => {
    //Destructuring response token from request body
    const token = req.body.token;
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
      }
    } catch (err) {
      res.status(401).send({ message: 'Captcha Error' }); //401 is unauthorized
    }

    // validate email format
    if (!EmailValidator.validate(req.body.email)) {
      res.status(400).send({ message: 'Invalid email format!' });
      return;
    }

    const user = await User.findOne({ email: req.body.email }); //return document found
    if (user) {
      //if user exist
      if (bcrypt.compareSync(req.body.password, user.password)) {
        // generate otp
        const secret = speakeasy.generateSecret({ length: 20 });
        const temp_otp = speakeasy.totp({
          secret: secret.base32,
          encoding: 'base32',
        });
        // save temp_otp to user's temp_secret in database
        user.temp_secret = secret.base32;
        await user.save();
        mailOptions['to'] = user.email;
        mailOptions['html'] = `<h1>Your verification code is: ${temp_otp}</h1>`;
        // send email to user
        try {
          const response = await transporter.sendMail(mailOptions);
        } catch (error) {
          //Handle error in event of malformed email, email service down etc.
          console.log('Error sending OTP: ' + error);
          res.status(500).send({ message: 'Unable to send verification code, please try again later' }); //500 is internal server error
          return;
        }
        //compare password
        res.send({
          _id: user._id,
          email: user.email,
        });
        return; //no need to continue after this
      }
    }
    res.status(401).send({ message: 'Invalid email or password' }); //401 is unauthorized
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    // validate email format
    if (!EmailValidator.validate(newUser['email'])) {
      res.status(400).send({ message: 'Invalid email format!' });
      return;
    }
    const loginId = uuid(); // generate unique login id
    // saving generated login id to database
    newUser.login_id = loginId;
    const user = await newUser.save(); //save to database
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

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // validate email format
    if (!EmailValidator.validate(req.body.email)) {
      res.status(400).send({ message: 'Invalid email format!' });
      return;
    }
    const user = await User.findById(req.user._id); //you can do it like this because it was passed over from the isAuth
    if (user) {
      //if user is found
      user.name = req.body.name || user.name; //if requested to change, set it to the requested one, else take the default from db
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8); //8 is the salt
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser), //reupdate tokens and everything else
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.delete(
  '/deleteuser/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id;
    const user = await User.findByIdAndRemove(id).exec();
    res.send('user deleted');
    return;
  })
);

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
      });
      // save temp_otp to user's temp_secret in database
      user.temp_secret = secret.base32;
      await user.save();
      mailOptions['to'] = user.email;
      mailOptions['html'] = `<h1>Your verification code is: ${temp_otp}</h1>`;
      // send email to user
      try {
        const response = await transporter.sendMail(mailOptions);
      } catch (error) {
        //Handle error in event of malformed email, email service down etc.
        console.log('Error sending OTP: ' + error);
        res.status(500).send({ message: 'Unable to resend verification code, please try again later' }); //500 is internal server error
        return;
      }
      res.send('Code resend');
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

userRouter.post(
  '/verify',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.userId);
    const temp_otp = req.body.token;
    if (user) {
      const stored_secret = user.temp_secret;
      // Verify a given token
      var validToken = speakeasy.totp.verify({
        secret: stored_secret,
        encoding: 'base32',
        token: temp_otp,
        window: 1, // default is 1 = 30seconds, increase window by 1 = adding 30 seconds grace time from time code was generated
      });
      if (validToken) {
        // verification succeeded
        const loginId = uuid(); // generate unique login id
        // saving generated login id to database
        user.login_id = loginId;
        await user.save();
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
      }
    }
  })
);

userRouter.post(
  '/resetpassword',
  expressAsyncHandler(async (req, res) => {
    // validate email format
    if (!EmailValidator.validate(req.body.email)) {
      res.status(400).send({ message: 'Invalid email format!' });
      return;
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // generate random password
      const randomPassword = passwordgenerator.generate({
        length: 10,
        numbers: true,
        symbols: true,
        exclude: ['', '.', ','], // list of characters to exclude
        excludeSimilarCharacters: true,
      });
      // save new password generated to database
      user.password = bcrypt.hashSync(randomPassword);
      await user.save();
      mailOptions['to'] = user.email;
      mailOptions['subject'] = 'Password reset'
      mailOptions['html'] = `<h1>Your new login password is:${randomPassword}</h1>`;
      // send email to user
      try {
        const response = await transporter.sendMail(mailOptions);
      } catch (error) {
        //Handle error in event of malformed email, email service down etc.
        console.log('Error sending new password: ' + error);
        res.status(500).send({ message: 'Unable to send new password, please try again later' }); //500 is internal server error
        return;
      }
      res.send(`New password have been sent to ${user.email}`);
    } else {
      res.status(404).send({ message: 'Email does not exist' });
    }
  })
);

userRouter.post(
  '/checkloginid',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.userId);
    if(user){
      const login_id = req.body.loginId;
      if(login_id === user.login_id){ // if user's login id is different from saved login id in database
        res.send('No new login attempt');
      }else{
        res.status(404).send({ message: 'Your account has been logged in on another device' })
      }
    }else{
      res.status(404).send({ message: 'Your account has been removed' });
    }
  })
);

userRouter.put(
  '/update/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      const updatedUser = await user.save();
      const updatedUsers = await User.find({isAdmin: false});
      res.send(updatedUsers);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

export default userRouter;
