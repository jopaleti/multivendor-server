import { Request, Response, NextFunction } from "express";
import Product from "../model/product";
import Shop from "../model/shop";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import sendToken from "../utils/jwtToken";
import sendMail from "../utils/sendMail";
import sendShopToken from "../utils/shopToken";

// Create product
const createProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      console.log(shop);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      } else {
        type Image = string | string[];

        let images: Image[] = [];

        if (typeof req.body.images === "string") {
          images.push(req.body.images);
        } else {
          images = req.body.images;
        }

        const imagesLinks: { public_id: string; url: string }[] = [];

        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.uploader.upload(images[i] as string, {
            folder: "products",
          });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }

        const productData = req.body;
        productData.images = imagesLinks;
        productData.shop = shop;

        const product = await Product.create(productData);

        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  }
);

// get all products of a shop
const getAllShopProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await Product.findById({ shopId: req.params.id });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

// Delete product of a shop
const deleteShopProduct = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product: any = Product.findById(req.params.id);
      if (!product) {
        return next(
          new ErrorHandler("Product with this id doesn not found", 404)
        );
      }

      // If product exist loop through it and destroy it in a container
      for (let i = 0; i < product.images.length; i++) {
        const result = await cloudinary.uploader.destroy(
          product.images[i].public_id
        );
      }

      await product.remove();

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

// Get all products
const getAllProducts = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

// Review of a products
const productReview = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Getting all the required fields from body data
      const { user, rating, comment, productId, orderId } = req.body;
      // Getting the product from the productId supplied
      const product: any = await Product.findById(productId);

      const review: any = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = product.reviews.find(
        (rev: any) => rev.user._id === (req as any).user._id
      );
      // Checking if there is review for for this particular product by the user trying
      // to write this review, then just update the review, ortherwise push the review
      if (isReviewed) {
        product.reviews.forEach((rev: any) => {
          if (rev.user._id === (req as any).user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        product.reviews.push(review);
      }

      // To calculate the rating of the product using
      let avg = 0;
      // Increment the rating of the product from the product reviews
      product.reviews.forEach((rev: any) => (avg += rev.rating));

      // Calculate the product rating and save it to the database
      product.rating = avg / product.reviews.length;

      // Save the product now...
      await product.save({ validateBeforeSave: false });

      // Update the Order here......

      // await Order.findByIdAndUpdate(
      //   orderId,
      //   { $set: { "cart.$[elem].isReviewed": true } },
      //   { arrayFilters: [{ "elem._id": productId }], new: true }
      // );

      // Return the response here...
      res.status(200).json({
        success: true,
        messgae: "Reviewed successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

// Get all products --- Admin
const getAllProductsAdmin = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 500));
    }
  }
);

export {
  createProduct,
  getAllProducts,
  getAllShopProduct,
  deleteShopProduct,
  productReview,
  getAllProductsAdmin,
};
