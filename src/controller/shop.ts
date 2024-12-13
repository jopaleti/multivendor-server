import { v2 as cloudinary } from "cloudinary";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import catchAsyncErrors from "../middleware/catchAsyncErrors";
import Shop from "../model/shop";
import ErrorHandler from "../utils/ErrorHandler";
import sendToken from "../utils/jwtToken";
import sendMail from "../utils/sendMail";
import sendShopToken from "../utils/shopToken";

// Configure the cloudinary sdk

// Create the shop or vendor
const createSeller = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        email,
        avatar,
        username,
        password,
        address,
        phoneNumber,
        zipCode,
      } = req.body;
      const sellerEmail = await Shop.findOne({ email });

      if (sellerEmail) {
        return next(new ErrorHandler("User already exist", 400));
      }

      var myCloud: any;
      if (avatar && avatar != "") {
        myCloud = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
        });
      }

      const seller = {
        username: username,
        email: email,
        password: password,
        avatar: {
          public_id: (myCloud && myCloud.public_id) || "",
          url: (myCloud && myCloud.secure_url) || "",
        },
        address: address,
        phoneNumber: phoneNumber,
        zipCode: zipCode,
      };

      const activationToken = createActivationToken(seller);
      const activationUrl = `http://localhost:${process.env.PORT}/api/v1/seller/activation/${activationToken}`;

      try {
        await sendMail({
          email: seller.email,
          subject: "Activate your shop",
          message: `Hello ${seller.username}, please click on the link to activate your shop: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email:- ${seller.email} to activate your shop`,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// create activation token
const createActivationToken = (seller: any) => {
  const ACTIVATION_SECRET: any = process.env.ACTIVATION_SECRET;
  return jwt.sign({ seller: seller }, ACTIVATION_SECRET, { expiresIn: "1h" });
};

// Activate seller
const sellerActivation = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token } = req.params || req.body;
      const ACTIVATION_SECRET: any = process.env.ACTIVATION_SECRET;
      const newSeller: any = jwt.verify(activation_token, ACTIVATION_SECRET);

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const {
        username,
        email,
        password,
        avatar,
        zipCode,
        address,
        phoneNumber,
      } = newSeller.seller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        username,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      const token = sendShopToken(seller, 201, res);
      res.status(200).json({
        success: true,
        seller,
        token,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Login Shop
const loginShop = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }
      const seller = await Shop.findOne({ email }).select("+password");

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await seller.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }
      const token = sendShopToken(seller, 201, res);
      res.status(200).json({
        success: true,
        seller,
        token,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Load shop
const getSeller = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seller: any = await Shop.findById((req as any).seller._id);

      if (!seller) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Logout Shop
const logOutShop = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get shop info
const getShopInfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Update seller profile picture
const updateSellerProfilePicture = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let existSeller: any = await Shop.findById((req as any).seller._id);

      if (req.body.avatar !== "") {
        const imageId = existSeller.avatar.public_id;

        imageId && (await cloudinary.uploader.destroy(imageId));

        const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
          public_id: "olympic_flag",
        });

        existSeller.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await existSeller.save();

      res.status(200).json({
        success: true,
        user: existSeller,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Update seller info
const updateSellerInfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, description, address, phoneNumber, zipCode } = req.body;
      const shop: any = await Shop.findOne((req as any).seller._id);

      if (!shop) {
        return next(new ErrorHandler("User not found", 400));
      }

      shop.username = username ? username : shop.username;
      shop.description = description ? description : shop.description;
      shop.address = address ? address : shop.address;
      shop.phoneNumber = phoneNumber ? phoneNumber : shop.phoneNumber;
      shop.zipCode = zipCode ? zipCode : shop.zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// All sellers for admin
const getAllSellers = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellers = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Delete seller by an Admin --- Admin
const deleteSeller = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Update seller withdraw method --- sellers
const updateSellerWithdraw = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate((req as any).seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete seller withdraw merthods --- only seller
const deleteSellerWithdraw = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const seller: any = await Shop.findById((req as any).seller._id);

      if (!seller) {
        return next(new ErrorHandler("Seller not found with this id", 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export {
  createSeller,
  sellerActivation,
  loginShop,
  getSeller,
  logOutShop,
  getShopInfo,
  updateSellerProfilePicture,
  updateSellerInfo,
  getAllSellers,
  deleteSeller,
  updateSellerWithdraw,
  deleteSellerWithdraw,
};
