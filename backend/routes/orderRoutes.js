import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import { isAuth } from "../utils.js";
import { lettersOnly } from "../utils.js";
import { numbersOnly } from "../utils.js";
import { alphanumeric } from "../utils.js";

const orderRouter = express.Router();

orderRouter.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});

//isAuth is the an additioanl middle ware in utils.js, check:http://expressjs.com/en/4x/api.html#app.post.method
orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (numbersOnly(req.body.shippingAddress.postalCode) && lettersOnly(req.body.shippingAddress.fullName)
      && alphanumeric(req.body.shippingAddress.address) && lettersOnly(req.body.shippingAddress.city)) {
      const newOrder = new Order({
        //to fill up and ref the ObjectId of Mongoose type as made in the model
        orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id, //get from isAuth
      });
      const order = await newOrder.save();
      //send back to front end on the order that was saved
      //required the next redirection is actually to order._id
      res.status(201).send({ message: "New Order Created", order });
    }
    else {
      res.status(404).send({ message: "Failed To Create New Order" });
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
