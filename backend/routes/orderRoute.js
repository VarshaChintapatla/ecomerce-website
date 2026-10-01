import express from "express";

import {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    verifyStripe,
    verifyRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    deleteOrder
} from "../controllers/orderController.js";

import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

orderRouter.post(
    "/place",
    authUser,
    placeOrder
);

orderRouter.post(
    "/stripe",
    authUser,
    placeOrderStripe
);

orderRouter.post(
    "/verifyStripe",
    verifyStripe
);

orderRouter.post(
    "/razorpay",
    authUser,
    placeOrderRazorpay
);

orderRouter.post(
    "/verifyRazorpay",
    authUser,
    verifyRazorpay
);

orderRouter.post(
    "/userorders",
    authUser,
    userOrders
);

orderRouter.post(
    "/list",
    allOrders
);

orderRouter.post(
    "/status",
    updateStatus
);

orderRouter.post(
    "/delete",
    deleteOrder
);

export default orderRouter;