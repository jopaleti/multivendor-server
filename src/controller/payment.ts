import { Request, Response, NextFunction } from "express";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
const https = require("https");

const initialiseTransaction = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Getting the customers email and amount
      const { email, totalPrice } = req.body;
      const params: any = JSON.stringify({
        email: email,
        amount: totalPrice,
      });

      const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
      const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: "/transaction/initialize",
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      };
      // Creating a paystackReq that will be used to initiate a request to paystack api
      const paystackReq: any = https
        .request(options, (result: any) => {
          let data: any = "";

          result.on("data", (chunk: any) => {
            data += chunk;
          });

          result.on("end", () => {
            //   Parsing the data into the data variable
            data = JSON.parse(data);
            console.log(data);
            //   Sending the authorisation URL as a response
            res.status(200).json({
              status: true,
              message: "Payment authorisation URL has been created!",
              authorization_url: data.data.authorization_url,
            });
          });
        })
        .on("error", (error: any) => {
          console.error(error);
        });

      // Initiating the HTTP request to paystack API
      paystackReq.write(params);
      paystackReq.end();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export default initialiseTransaction;
