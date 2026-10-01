import express from "express";
import cors from "cors";
import "dotenv/config";
import dns from "dns";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

connectDB();
connectCloudinary();

app.use(cors({
    origin: [
        "https://ecomerce-website-frontend-eight.vercel.app",
        "https://ecomerce-website-9mfa.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"]
}));

app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
    res.send("API Working");
});

export default app;