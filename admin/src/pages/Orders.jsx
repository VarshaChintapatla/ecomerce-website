import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const Orders = ({ token }) => {
    const [orders, setOrders] = useState([]);

    const fetchAllOrders = async () => {
        try {
            const response = await axios.post(
                backendUrl + "/api/order/list",
                {},
                {
                    headers: {
                        token: token
                    }
                }
            );

            console.log(
                "Orders response:",
                response.data
            );

            if (response.data.success) {
                setOrders(response.data.orders);
            } else {
                toast.error(response.data.message);
            }

        } catch (error) {
            console.log(
                "Orders error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to load orders"
            );
        }
    };

    const statusHandler = async (
        event,
        orderId
    ) => {
        try {
            const response = await axios.post(
                backendUrl + "/api/order/status",
                {
                    orderId: orderId,
                    status: event.target.value
                },
                {
                    headers: {
                        token: token
                    }
                }
            );

            if (response.data.success) {
                await fetchAllOrders();
            } else {
                toast.error(
                    response.data.message
                );
            }

        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update status"
            );
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            const confirmDelete =
                window.confirm(
                    "Are you sure you want to delete this order?"
                );

            if (!confirmDelete) {
                return;
            }

            const response = await axios.post(
                backendUrl + "/api/order/delete",
                {
                    orderId: orderId
                },
                {
                    headers: {
                        token: token
                    }
                }
            );

            if (response.data.success) {
                toast.success(
                    "Order deleted successfully"
                );

                setOrders((prevOrders) =>
                    prevOrders.filter(
                        (order) =>
                            order._id !== orderId
                    )
                );

            } else {
                toast.error(
                    response.data.message
                );
            }

        } catch (error) {
            console.log(
                "Delete order error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to delete order"
            );
        }
    };

    useEffect(() => {
        if (token) {
            fetchAllOrders();
        }
    }, [token]);

    return (
        <div>
            <h3 className="text-2xl font-semibold mb-5">
                Orders
            </h3>

            <div className="flex flex-col gap-5">

                {orders.length === 0 ? (
                    <p>No orders found</p>
                ) : (

                    orders.map((order, index) => (

                        <div
                            key={
                                order._id ||
                                index
                            }
                            className="border rounded p-5 bg-white"
                        >

                            <div className="flex flex-col gap-4">

                                <div>
                                    <p className="font-medium">
                                        Order ID
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {order._id}
                                    </p>
                                </div>


                                <div>
                                    <p className="font-medium mb-3">
                                        Items
                                    </p>

                                    {order.items?.map(
                                        (
                                            item,
                                            itemIndex
                                        ) => (

                                            <div
                                                key={
                                                    itemIndex
                                                }
                                                className="flex gap-4 mb-4"
                                            >

                                                <img
                                                    src={
                                                        item.image?.[0]
                                                    }
                                                    alt={
                                                        item.name
                                                    }
                                                    className="w-20 h-20 object-cover"
                                                />

                                                <div>

                                                    <p className="font-medium">
                                                        {item.name}
                                                    </p>

                                                    <p>
                                                        Size:{" "}
                                                        {item.size}
                                                    </p>

                                                    <p>
                                                        Quantity:{" "}
                                                        {item.quantity}
                                                    </p>

                                                    <p>
                                                        Price:{" "}
                                                        {currency}
                                                        {item.price}
                                                    </p>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>


                                <div>

                                    <p>
                                        <b>
                                            Amount:
                                        </b>{" "}
                                        {currency}
                                        {order.amount}
                                    </p>

                                    <p>
                                        <b>
                                            Payment Method:
                                        </b>{" "}
                                        {
                                            order.paymentMethod
                                        }
                                    </p>

                                    <p>
                                        <b>
                                            Payment:
                                        </b>{" "}
                                        {
                                            order.payment
                                                ? "Paid"
                                                : "Pending"
                                        }
                                    </p>

                                    <p>
                                        <b>
                                            Date:
                                        </b>{" "}
                                        {new Date(
                                            order.date
                                        ).toLocaleDateString()}
                                    </p>

                                </div>


                                <div>

                                    <p className="font-medium mb-2">
                                        Delivery Address
                                    </p>

                                    <p>
                                        {
                                            order.address
                                                ?.firstName
                                        }{" "}
                                        {
                                            order.address
                                                ?.lastName
                                        }
                                    </p>

                                    <p>
                                        {
                                            order.address
                                                ?.street
                                        }
                                    </p>

                                    <p>
                                        {
                                            order.address
                                                ?.city
                                        }
                                        ,{" "}
                                        {
                                            order.address
                                                ?.state
                                        }
                                    </p>

                                    <p>
                                        {
                                            order.address
                                                ?.zipcode
                                        }
                                        ,{" "}
                                        {
                                            order.address
                                                ?.country
                                        }
                                    </p>

                                    <p>
                                        Phone:{" "}
                                        {
                                            order.address
                                                ?.phone
                                        }
                                    </p>

                                </div>


                                <div className="flex items-center gap-3">

                                    <select
                                        value={
                                            order.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            statusHandler(
                                                event,
                                                order._id
                                            )
                                        }
                                        className="border px-3 py-2"
                                    >

                                        <option value="Order Placed">
                                            Order Placed
                                        </option>

                                        <option value="Packing">
                                            Packing
                                        </option>

                                        <option value="Shipped">
                                            Shipped
                                        </option>

                                        <option value="Out for delivery">
                                            Out for delivery
                                        </option>

                                        <option value="Delivered">
                                            Delivered
                                        </option>

                                    </select>


                                    <button
                                        onClick={() =>
                                            deleteOrder(
                                                order._id
                                            )
                                        }
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
};

export default Orders;