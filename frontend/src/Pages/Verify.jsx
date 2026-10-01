import React, { useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const Verify = () => {
    const [searchParams] = useSearchParams();

    const {
        backendUrl,
        setCartItems,
        navigate
    } = useContext(ShopContext);

    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const userId = searchParams.get("userId");

    useEffect(() => {
        const verifyPayment = async () => {
            console.log("VERIFY PAGE LOADED");
            console.log("success:", success);
            console.log("orderId:", orderId);
            console.log("userId:", userId);

            if (!success || !orderId || !userId) {
                console.log("Payment details missing");
                navigate("/place-order");
                return;
            }

            try {
                const response = await axios.post(
                    backendUrl + "/api/order/verifyStripe",
                    {
                        success: success,
                        orderId: orderId,
                        userId: userId
                    }
                );

                console.log(
                    "STRIPE VERIFY RESPONSE:",
                    response.data
                );

                if (response.data.success) {
                    console.log("PAYMENT VERIFIED");

                    setCartItems({});

                    console.log("CART CLEARED");

                    navigate("/orders", {
                        replace: true
                    });
                } else {
                    console.log(
                        "PAYMENT VERIFICATION FAILED:",
                        response.data.message
                    );

                    navigate("/place-order");
                }

            } catch (error) {
                console.log(
                    "VERIFY ERROR:",
                    error.response?.data || error
                );

                navigate("/place-order");
            }
        };

        verifyPayment();
    }, []);

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-lg">
                Verifying payment...
            </p>
        </div>
    );
};

export default Verify;