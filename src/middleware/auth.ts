import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "./catchAsyncErrors";
import jwt from "jsonwebtoken";
import User from "../model/user";
import Shop from "../model/shop";

// Creating authentication middleware
const isAuthenticated = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    // Destructuring token from the cookies
    const { token } = req.cookies;
    console.log({ token: req.cookies });
    if (!token) {
      return next(new ErrorHandler("Please login to continue", 401));
    }

    const jwt_key: any = process.env.JWT_SECRET_KEY;
    const decoded: any = jwt.verify(token, jwt_key);

    (req as any).user = await User.findById(decoded.id);
    next();
  }
);

// Creating isSeller middleware
const isSeller = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { seller_token } = req.cookies;
    if (!seller_token) {
      return next(new ErrorHandler("Please login to continue", 401));
    }
    const jwt_key: any = process.env.JWT_SECRET_KEY;
    const decoded: any = jwt.verify(seller_token, jwt_key);
    (req as any).seller = await Shop.findById(decoded.id);

    next();
  }
);

// Creating isAdmin middleware
const isAdmin = (...roles: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return next(
        new ErrorHandler(
          `${(req as any).user.role} cannot access this resource!`,
          403
        )
      );
    }
    next();
  };
};

// Creating a reset password controller

export { isAuthenticated, isSeller, isAdmin };
 