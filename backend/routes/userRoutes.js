import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { isAuth, generateToken } from '../utils.js';
import axios from 'axios';
import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';
import dotenv from "dotenv";

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

userRouter.get('/', async (req, res) => {
  const users = await User.find({ isAdmin: false });
  res.send(users);
});

userRouter.post(
  '/signin',
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
        // send email to user
        transporter.sendMail({
          to: user.email,
          subject: 'Verification code',
          html: `<h1>Your verification code is: ${temp_otp}</h1>`,
        });
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
    const user = await newUser.save(); //save to database
    //then send the response back to front end
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
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
      // send email to user
      transporter.sendMail({
        to: user.email,
        subject: 'Verification code',
        html: `<h1>Your verification code is: ${temp_otp}</h1>`,
      });
      res.send('Code resend');
    }else{
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
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
      } else {
        res.status(404).send({ message: 'Wrong or expired code entered' });
      }
    }
  })
);

export default userRouter;
