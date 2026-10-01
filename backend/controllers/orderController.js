import crypto from "crypto";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import Stripe from "stripe";

const currency = "INR";
const deliveryCharge = 10;

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY
);

const placeOrder = async (req, res) => {
    try {
        const {
            userId,
            items,
            amount,
            address
        } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            status: "Order Placed",
            date: Date.now()
        };

        const newOrder =
            new orderModel(orderData);

        await newOrder.save();

        await userModel.findByIdAndUpdate(
            userId,
            {
                cartData: {}
            }
        );

        res.json({
            success: true,
            message: "Order Placed"
        });

    } catch (error) {
        console.log(
            "COD ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

const placeOrderRazorpay = async (req, res) => {
    try {
        const {
            userId,
            items,
            amount,
            address
        } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Razorpay",
            payment: false,
            status: "Order Placed",
            date: Date.now()
        };

        const newOrder =
            new orderModel(orderData);

        await newOrder.save();

        const options = {
            amount: Math.round(
                amount * 100
            ),
            currency: currency,
            receipt: newOrder._id.toString()
        };

        const razorpayOrder =
            await razorpayInstance.orders.create(
                options
            );

        res.json({
            success: true,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency:
                    razorpayOrder.currency
            }
        });

    } catch (error) {
        console.log(
            "RAZORPAY ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

const verifyRazorpay = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");

        if (
            generatedSignature !==
            razorpay_signature
        ) {
            return res.json({
                success: false,
                message:
                    "Payment verification failed"
            });
        }

        const razorpayOrder =
            await razorpayInstance.orders.fetch(
                razorpay_order_id
            );

        console.log(
            "RAZORPAY ORDER INFO:",
            razorpayOrder
        );

        if (
            razorpayOrder.status !==
            "paid"
        ) {
            return res.json({
                success: false,
                message:
                    "Payment is not completed"
            });
        }

        const order =
            await orderModel.findById(
                razorpayOrder.receipt
            );

        if (!order) {
            return res.json({
                success: false,
                message:
                    "Order not found"
            });
        }

        order.payment = true;

        await order.save();

        await userModel.findByIdAndUpdate(
            order.userId,
            {
                cartData: {}
            }
        );

        res.json({
            success: true,
            message:
                "Payment verified successfully"
        });

    } catch (error) {
        console.log(
            "RAZORPAY VERIFY ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

const placeOrderStripe = async (req, res) => {
    try {
        const {
            userId,
            items,
            amount,
            address
        } = req.body;

        const origin =
            req.headers.origin ||
            process.env.FRONTEND_URL;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "Stripe",
            payment: false,
            status: "Order Placed",
            date: Date.now()
        };

        const newOrder =
            new orderModel(orderData);

        await newOrder.save();

        const line_items =
            items.map((item) => ({
                price_data: {
                    currency: "inr",

                    product_data: {
                        name: item.name
                    },

                    unit_amount:
                        Math.round(
                            item.price * 100
                        )
                },

                quantity: item.quantity
            }));

        if (deliveryCharge > 0) {
            line_items.push({
                price_data: {
                    currency: "inr",

                    product_data: {
                        name: "Delivery Charge"
                    },

                    unit_amount:
                        Math.round(
                            deliveryCharge * 100
                        )
                },

                quantity: 1
            });
        }

        const session =
            await stripe.checkout.sessions.create({
                line_items: line_items,
                mode: "payment",

                success_url:
                    `${origin}/verify?success=true&orderId=${newOrder._id}&userId=${userId}`,

                cancel_url:
                    `${origin}/verify?success=false&orderId=${newOrder._id}&userId=${userId}`
            });

        res.json({
            success: true,
            session_url: session.url
        });

    } catch (error) {
        console.log(
            "STRIPE ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

const verifyStripe = async (req, res) => {
    try {
        const {
            orderId,
            success,
            userId
        } = req.body;

        if (
            !orderId ||
            !userId
        ) {
            return res.json({
                success: false,
                message:
                    "Order ID or User ID missing"
            });
        }

        if (success === "true") {

            const order =
                await orderModel.findById(
                    orderId
                );

            if (!order) {
                return res.json({
                    success: false,
                    message:
                        "Order not found"
                });
            }

            order.payment = true;

            await order.save();

            await userModel.findByIdAndUpdate(
                userId,
                {
                    cartData: {}
                }
            );

            return res.json({
                success: true,
                message:
                    "Payment verified successfully"
            });
        }

        await orderModel.findByIdAndDelete(
            orderId
        );

        res.json({
            success: false,
            message:
                "Payment cancelled"
        });

    } catch (error) {
        console.log(
            "STRIPE VERIFY ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

const allOrders = async (req, res) => {
    try {
        const orders =
            await orderModel.find({});

        res.json({
            success: true,
            orders: orders
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

const userOrders = async (req, res) => {
    try {
        const {
            userId
        } = req.body;

        const orders =
            await orderModel.find({
                userId: userId
            });

        res.json({
            success: true,
            orders: orders
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

const updateStatus = async (req, res) => {
    try {
        const {
            orderId,
            status
        } = req.body;

        await orderModel.findByIdAndUpdate(
            orderId,
            {
                status: status
            }
        );

        res.json({
            success: true,
            message:
                "Status Updated"
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const {
            orderId
        } = req.body;

        if (!orderId) {
            return res.json({
                success: false,
                message:
                    "Order ID is required"
            });
        }

        const deletedOrder =
            await orderModel.findByIdAndDelete(
                orderId
            );

        if (!deletedOrder) {
            return res.json({
                success: false,
                message:
                    "Order not found"
            });
        }

        res.json({
            success: true,
            message:
                "Order deleted successfully"
        });

    } catch (error) {
        console.log(
            "DELETE ORDER ERROR:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });
    }
};

export {
    placeOrder,
    placeOrderStripe,
    placeOrderRazorpay,
    verifyStripe,
    verifyRazorpay,
    allOrders,
    userOrders,
    updateStatus,
    deleteOrder
};