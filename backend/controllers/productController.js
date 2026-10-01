import productModel from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";

const addProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            subCategory,
            sizes,
            bestseller
        } = req.body;

        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];

        const images = [image1, image2, image3, image4].filter(
            (item) => item !== undefined
        );

        console.log("Images received:", images.length);

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                console.log("Uploading:", item.path);

                const result = await cloudinary.uploader.upload(item.path, {
                    resource_type: "image"
                });

                console.log("Upload successful");

                return result.secure_url;
            })
        );

        console.log("Cloudinary URLs:", imagesUrl);

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true",
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        };

        const product = new productModel(productData);

        await product.save();

        console.log("Product saved");

        res.json({
            success: true,
            message: "Product added successfully"
        });

    } catch (error) {
        console.log("ERROR:", error);
        console.log("MESSAGE:", error.message);
        console.log("HTTP CODE:", error.http_code);

        res.json({
            success: false,
            message: error.message
        });
    }
};

const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({});

        res.json({
            success: true,
            products
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;

        await productModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Product removed successfully"
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await productModel.findById(productId);

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};

export {
    addProduct,
    listProducts,
    removeProduct,
    singleProduct
};

