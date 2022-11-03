import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { isAuth } from "../utils.js";
import { lettersOnly } from "../utils.js";
import { numbersOnly } from "../utils.js";
import { alphanumeric } from "../utils.js";
import Log from '../models/logModel.js';
import ratelimit from 'express-rate-limit';

const orderRouter = express.Router();

var itemPriceCombined = 0.0;
var shippingPrice = 0.0;
var taxPrice = 0.0;
var totalCost = 0.0;



// prevent multiple orders
const orderlimiter = ratelimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  statusCode: 401,
  message: {
    limiter: true,
    type: 'error',
    message: 'Too many requests, please try again later.',
  },
});

// Get actual cookie pricing from DB
async function calculateValue(req, res, next) {
  try {
    const idAndQuantityObj = req.body.orderItems.map(a => ({ id: a._id, quantity: a.quantity }));
    var itemPrice = 0;

    for (const [key, idAndQuantityDict] of Object.entries(idAndQuantityObj)) {
      const productID = idAndQuantityDict.id;
      const cookieQuantity = idAndQuantityDict.quantity;
      var cookie = await Product.findById(productID);
      itemPrice = (cookie.price * cookieQuantity);
      itemPriceCombined += itemPrice
    };

    shippingPrice = itemPriceCombined > 100 ? 2 : 10;
    taxPrice = (itemPriceCombined * 0.15);
    totalCost = (itemPriceCombined + shippingPrice + taxPrice);
    next();
  } catch (err) {
    res.status(401).send({ message: "Item / Cart price mismatch" });
  }
}

orderRouter.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});

//isAuth is the an additioanl middle ware in utils.js, check:http://expressjs.com/en/4x/api.html#app.post.method
orderRouter.post(
  "/",
  orderlimiter,
  isAuth,
  calculateValue,
  expressAsyncHandler(async (req, res) => {

    const createOrderLog = new Log({
      user: req.user._id,
      isAdmin: req.user.isAdmin,
      statusCode: "201",
      activity: "New Order Created",
    })
    const createOrderFLog = new Log({
      user: req.user._id,
      isAdmin: req.user.isAdmin,
      statusCode: "404",
      activity: "Failed To Create New Order",
    })

    if (numbersOnly(req.body.shippingAddress.postalCode) && lettersOnly(req.body.shippingAddress.fullName)
      && alphanumeric(req.body.shippingAddress.address) && lettersOnly(req.body.shippingAddress.city)) {
      const newOrder = new Order({
        //to fill up and ref the ObjectId of Mongoose type as made in the model
        orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: itemPriceCombined,
        shippingPrice: shippingPrice,
        taxPrice: taxPrice,
        totalPrice: totalCost,
        user: req.user._id, //get from isAuth
      });
      const order = await newOrder.save();
      //send back to front end on the order that was saved
      //required the next redirection is actually to order._id
      res.status(201).send({ message: "New Order Created", order });
      await createOrderLog.save();
    }
    else {
      res.status(404).send({ message: "Failed To Create New Order" });
      await createOrderFLog.save();
    }
  })
);

//have to come before /:id because they can conflict and use the other one first, this one should have priority here
orderRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

//id
orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);

//pay
orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.send({ message: "Order Paid", order: updatedOrder });
    } else {
      res.status(404)({ message: "Order Not Found" });
    }
  })
);

//update
orderRouter.put(
  '/update/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = req.body.isDelivered
      const updatedOrder = await order.save();
      res.send(updatedOrder);
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);

//delete
orderRouter.delete(
  '/delete/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const id = req.params.id
    const order = await Order.findByIdAndRemove(id).exec();
    res.send("order deleted");
    return;
  })
);


export default orderRouter;
