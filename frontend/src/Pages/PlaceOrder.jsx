import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";
import CartTotal from "../Components/CartTotal";

const PlaceOrder = () => {
    const [method, setMethod] = useState("cod");

    const {
        navigate,
        backendUrl,
        token,
        cartItems,
        setCartItems,
        products,
        getCartAmount,
        delivery_fee
    } = useContext(ShopContext);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFormData((data) => ({
            ...data,
            [name]: value
        }));
    };

    const initPay = (order) => {
        console.log("RAZORPAY ORDER:", order);

        if (!window.Razorpay) {
            toast.error("Razorpay is not loaded");
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "Forever",
            description: "Order Payment",
            order_id: order.id,

            handler: async (response) => {
                console.log(
                    "RAZORPAY PAYMENT RESPONSE:",
                    response
                );

                try {
                    const verifyResponse = await axios.post(
                        backendUrl + "/api/order/verifyRazorpay",
                        {
                            razorpay_order_id:
                                response.razorpay_order_id,

                            razorpay_payment_id:
                                response.razorpay_payment_id,

                            razorpay_signature:
                                response.razorpay_signature
                        },
                        {
                            headers: {
                                token: token
                            }
                        }
                    );

                    console.log(
                        "RAZORPAY VERIFY RESPONSE:",
                        verifyResponse.data
                    );

                    if (
                        verifyResponse.data.success
                    ) {
                        setCartItems({});

                        toast.success(
                            "Payment Successful"
                        );

                        navigate("/orders");
                    } else {
                        toast.error(
                            verifyResponse.data.message ||
                            "Payment verification failed"
                        );
                    }

                } catch (error) {
                    console.log(
                        "RAZORPAY VERIFY ERROR:",
                        error
                    );

                    toast.error(
                        error.response?.data?.message ||
                        "Payment verification failed"
                    );
                }
            },

            modal: {
                ondismiss: () => {
                    toast.error(
                        "Payment cancelled"
                    );
                }
            },

            theme: {
                color: "#000000"
            }
        };

        const razorpay =
            new window.Razorpay(options);

        razorpay.open();
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        try {
            let orderItems = [];

            for (const productId in cartItems) {
                for (
                    const size in cartItems[productId]
                ) {
                    if (
                        cartItems[productId][size] > 0
                    ) {
                        const itemInfo =
                            structuredClone(
                                products.find(
                                    (product) =>
                                        product._id ===
                                        productId
                                )
                            );

                        if (itemInfo) {
                            itemInfo.size = size;

                            itemInfo.quantity =
                                cartItems[productId][size];

                            orderItems.push(itemInfo);
                        }
                    }
                }
            }

            if (orderItems.length === 0) {
                toast.error(
                    "Your cart is empty"
                );
                return;
            }

            const orderData = {
                items: orderItems,
                amount:
                    getCartAmount() +
                    delivery_fee,
                address: formData
            };

            console.log(
                "ORDER DATA:",
                orderData
            );

            let response;

            if (method === "cod") {
                response = await axios.post(
                    backendUrl +
                        "/api/order/place",
                    orderData,
                    {
                        headers: {
                            token: token
                        }
                    }
                );

                if (
                    response.data.success
                ) {
                    setCartItems({});

                    toast.success(
                        "Order Placed Successfully"
                    );

                    navigate("/orders");
                } else {
                    toast.error(
                        response.data.message ||
                        "Order placement failed"
                    );
                }
            }

            if (method === "razorpay") {
                console.log(
                    "RAZORPAY SELECTED"
                );

                response = await axios.post(
                    backendUrl +
                        "/api/order/razorpay",
                    orderData,
                    {
                        headers: {
                            token: token
                        }
                    }
                );

                console.log(
                    "RAZORPAY RESPONSE:",
                    response.data
                );

                if (
                    response.data.success
                ) {
                    initPay(
                        response.data.order
                    );
                } else {
                    toast.error(
                        response.data.message ||
                        "Razorpay order creation failed"
                    );
                }
            }

            if (method === "stripe") {
                console.log(
                    "STRIPE SELECTED"
                );

                response = await axios.post(
                    backendUrl +
                        "/api/order/stripe",
                    orderData,
                    {
                        headers: {
                            token: token
                        }
                    }
                );

                console.log(
                    "STRIPE RESPONSE:",
                    response.data
                );

                if (
                    response.data.success
                ) {
                    window.location.href =
                        response.data.session_url;
                } else {
                    toast.error(
                        response.data.message ||
                        "Stripe order creation failed"
                    );
                }
            }

        } catch (error) {
            console.log(
                "PLACE ORDER ERROR:",
                error
            );

            console.log(
                "ERROR RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <form
            onSubmit={onSubmitHandler}
            className="flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] border-t"
        >
            <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">

                <div className="text-xl sm:text-2xl my-3">
                    <p>
                        DELIVERY{" "}
                        <span className="font-medium">
                            INFORMATION
                        </span>
                    </p>
                </div>

                <div className="flex gap-3">
                    <input
                        required
                        onChange={onChangeHandler}
                        name="firstName"
                        value={formData.firstName}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="First name"
                    />

                    <input
                        required
                        onChange={onChangeHandler}
                        name="lastName"
                        value={formData.lastName}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="Last name"
                    />
                </div>

                <input
                    required
                    onChange={onChangeHandler}
                    name="email"
                    value={formData.email}
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                    type="email"
                    placeholder="Email address"
                />

                <input
                    required
                    onChange={onChangeHandler}
                    name="street"
                    value={formData.street}
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                    type="text"
                    placeholder="Street"
                />

                <div className="flex gap-3">
                    <input
                        required
                        onChange={onChangeHandler}
                        name="city"
                        value={formData.city}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="City"
                    />

                    <input
                        required
                        onChange={onChangeHandler}
                        name="state"
                        value={formData.state}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="State"
                    />
                </div>

                <div className="flex gap-3">
                    <input
                        required
                        onChange={onChangeHandler}
                        name="zipcode"
                        value={formData.zipcode}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="number"
                        placeholder="Zipcode"
                    />

                    <input
                        required
                        onChange={onChangeHandler}
                        name="country"
                        value={formData.country}
                        className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                        type="text"
                        placeholder="Country"
                    />
                </div>

                <input
                    required
                    onChange={onChangeHandler}
                    name="phone"
                    value={formData.phone}
                    className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                    type="number"
                    placeholder="Phone"
                />
            </div>

            <div className="mt-8 min-w-80">

                <CartTotal />

                <div className="mt-12">

                    <p className="text-xl">
                        PAYMENT{" "}
                        <span className="font-medium">
                            METHOD
                        </span>
                    </p>

                    <div className="flex gap-3 flex-col lg:flex-row mt-4">

                        <div
                            onClick={() =>
                                setMethod("stripe")
                            }
                            className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
                        >
                            <p
                                className={`min-w-3.5 h-3.5 border rounded-full ${
                                    method === "stripe"
                                        ? "bg-green-400"
                                        : ""
                                }`}
                            ></p>

                            <p className="text-gray-500 text-sm font-medium">
                                STRIPE
                            </p>
                        </div>

                        <div
                            onClick={() =>
                                setMethod("razorpay")
                            }
                            className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
                        >
                            <p
                                className={`min-w-3.5 h-3.5 border rounded-full ${
                                    method === "razorpay"
                                        ? "bg-green-400"
                                        : ""
                                }`}
                            ></p>

                            <p className="text-gray-500 text-sm font-medium">
                                RAZORPAY
                            </p>
                        </div>

                        <div
                            onClick={() =>
                                setMethod("cod")
                            }
                            className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
                        >
                            <p
                                className={`min-w-3.5 h-3.5 border rounded-full ${
                                    method === "cod"
                                        ? "bg-green-400"
                                        : ""
                                }`}
                            ></p>

                            <p className="text-gray-500 text-sm font-medium">
                                CASH ON DELIVERY
                            </p>
                        </div>

                    </div>

                    <div className="w-full text-end mt-8">

                        <button
                            type="submit"
                            className="bg-black text-white px-16 py-3 text-sm"
                        >
                            PLACE ORDER
                        </button>

                    </div>

                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;