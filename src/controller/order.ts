import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import sendToken from "../utils/jwtToken";
import sendMail from "../utils/sendMail";
import sendShopToken from "../utils/shopToken";
import Order from "../model/order";
import Product from "../model/product";

// Create new order
const createOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      //   group cart items by shopId
      const shopItemsMap: any = new Map<string, any[]>();

      for (const item of cart) {
        const shopId: string = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop
      const orders: any[] = [];

      for (const [shopId, items] of shopItemsMap) {
        const order: any = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }
  }
);

// Get all orders
const getAllOrder = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    catchAsyncErrors(async (req, res, next) => {
      try {
        const orders = await Order.find({
          "user._id": req.params.userId,
        }).sort({
          createdAt: -1,
        });

        res.status(200).json({
          success: true,
          orders,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    });
  }
);

// Get All Order of Seller
const getSellerOrder = catchAsyncErrors(
  // Send the shopId in the params with the request
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Give a refund ----- user
const orderRefundRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const status = req.body.status;
    const orderId = req.params.id;
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      // Resetting the default status of the product
      order.status = status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Accept the refund -------- seller
const orderRefundSuccess = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderId = req.params.id;
      const status = req.body.status;
      const order = await Order.findById(req.params.id);
      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      // Resetting the default status of the product
      order.status = status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o: any) => {
          await updateOrder(o._id, o.quantity);
        });
      }

      async function updateOrder(id: any, qty: any) {
        const product: any = await Product.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// Get all orders for the admin
const adminGetAllOrders = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export {
  createOrder,
  getAllOrder,
  getSellerOrder,
  orderRefundRequest,
  orderRefundSuccess,
  adminGetAllOrders,
};
