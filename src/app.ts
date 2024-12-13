import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import errorMiddleWare from "./middleware/error";
import cookieParser from "cookie-parser";

// import routes
import userRouter from "./routes/userRoutes";
import sellerRouter from "./routes/sellerRoutes";
import productRouter from "./routes/productRoutes";
import orderRouter from "./routes/orderRoutes";
import withdrawRouter from "./routes/withdrawRoutes";
import paymentRouter from "./routes/paymentRoutes";
import blogRouter from "./routes/blogRoutes";

// config the dotenv
dotenv.config({ path: "./src/config/.env" });

// Initiallising app
const app = express();
app.use(cookieParser());

const allowedDomains = [
  "http://localhost:3000",
  "https://primedges-frontend.onrender.com/",
];
app.use(
  cors({
    origin: allowedDomains,
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "./src/config/.env" });
}

// It's for error handling
app.use(errorMiddleWare);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/seller", sellerRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/withdraw", withdrawRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/blog", blogRouter);

export default app;
