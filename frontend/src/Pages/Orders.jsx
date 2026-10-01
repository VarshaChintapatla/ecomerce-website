
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const Orders = () => {
    const { backendUrl, token, currency } = useContext(ShopContext);

    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
        try {
            if (!token) {
                return;
            }

            const response = await axios.post(
                backendUrl + "/api/order/userorders",
                {},
                {
                    headers: {
                        token: token
                    }
                }
            );

            if (response.data.success) {
                setOrders(response.data.orders.reverse());
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [token]);

    return (
        <div className="border-t pt-16">
            <div className="text-2xl">
                <p>
                    MY <span className="font-medium">ORDERS</span>
                </p>
            </div>

            <div>
                {orders.map((order, index) => (
                    <div
                        key={index}
                        className="py-4 border-b text-gray-700"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex flex-col gap-4">
                                {order.items.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className="flex items-start gap-6 text-sm"
                                    >
                                        <img
                                            className="w-20 h-20 object-cover"
                                            src={item.image?.[0]}
                                            alt={item.name}
                                        />

                                        <div>
                                            <p className="sm:text-base font-medium">
                                                {item.name}
                                            </p>

                                            <div className="flex gap-4 mt-2">
                                                <p>
                                                    {currency}
                                                    {item.price}
                                                </p>

                                                <p>
                                                    Quantity: {item.quantity}
                                                </p>

                                                <p>
                                                    Size: {item.size}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="md:w-1/4">
                                <p className="text-sm">
                                    <span className="font-medium">
                                        Order Date:
                                    </span>{" "}
                                    {new Date(order.date).toLocaleDateString()}
                                </p>

                                <p className="text-sm mt-2">
                                    <span className="font-medium">
                                        Payment:
                                    </span>{" "}
                                    {order.paymentMethod}
                                </p>

                                <p className="text-sm mt-2">
                                    <span className="font-medium">
                                        Payment Status:
                                    </span>{" "}
                                    {order.payment
                                        ? "Paid"
                                        : "Pending"}
                                </p>

                                <p className="text-sm mt-2">
                                    <span className="font-medium">
                                        Status:
                                    </span>{" "}
                                    {order.status}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm">
                                    <span className="font-medium">
                                        Amount:
                                    </span>{" "}
                                    {currency}
                                    {order.amount}
                                </p>

                                <button
                                    onClick={loadOrders}
                                    className="border px-4 py-2 text-sm mt-4"
                                >
                                    Track Order
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
