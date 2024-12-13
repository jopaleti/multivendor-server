import { Request, Response, NextFunction } from "express";
import Shop from "../model/shop";
import Withdraw from "../model/withdraw";
import sendMail from "../utils/sendMail";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../middleware/catchAsyncErrors";

// Create withdraw request
const createWithdrawRequest = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount } = req.body;

      const data = {
        seller: (req as any).seller,
        amount,
      };

      // Checked for whether the amount is within the shop limit
      const withdraw = await Withdraw.create(data);
      const shop: any = await Shop.findById((req as any).seller._id);
      if (shop.availableBalance >= amount) {
        shop.availableBalance = shop?.availableBalance - amount;
      } else {
        return next(
          new ErrorHandler("Amount exceeded the available balance", 400)
        );
      }

      try {
        await sendMail({
          email: (req as any).seller.email,
          subject: "Withdraw Request",
          message: `Hello ${
            (req as any).seller.name
          }, Your withdraw request of ${amount}$ is processing. It will take 3days to 7days to processing! `,
        });
        res.status(201).json({
          success: true,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      await shop.save();

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all withdraws ---- admin
const getAllWithdrawRequest = () => {
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const withdraws = await Withdraw.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        withdraws,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  });
};

// Update the withdraw request --- admin
const updateWithdraw = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try { 
      const { sellerId } = req.body;
      const withdraw: any = await Withdraw.findByIdAndUpdate(
        req.params.id,
        {
          status: "succeed",
          updatedAt: Date.now(),
        },
        { new: true }
      );
      const seller: any = await Shop.findById(sellerId);
      const transection = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };
      seller.transections = [...seller.transections, transection];
      await seller.save();
       try {
         await sendMail({
           email: seller.email,
           subject: "Payment confirmation",
           message: `Hello ${seller.name}, Your withdraw request of ${withdraw.amount}$ is on the way. Delivery time depends on your bank's rules it usually takes 3days to 7days.`,
         });
       } catch (error: any) {
         return next(new ErrorHandler(error.message, 500));
       }
       res.status(201).json({
         success: true,
         withdraw,
       });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Export the controllers
export {
  createWithdrawRequest,
  getAllWithdrawRequest,
  updateWithdraw
}