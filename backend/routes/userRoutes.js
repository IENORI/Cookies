import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { isAuth, generateToken } from "../utils.js";

const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
  const users = await User.find({ isAdmin: false });
  res.send(users);
});

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }); //return document found
    if (user) {
      //if user exist
      if (bcrypt.compareSync(req.body.password, user.password)) {
        //compare password
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return; //no need to continue after this
      }
    }
    res.status(401).send({ message: "Invalid email or password" }); //401 is unauthorized
  })
);

userRouter.post(
  "/signup",
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
  "/profile",
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
      res.status(404).send({ message: "User not found" });
    }
  })
);

userRouter.delete(
  '/deleteuser/:id',
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id
    const user = await User.findByIdAndRemove(id).exec();
    res.send("user deleted");
    return;
  })
);

export default userRouter;
