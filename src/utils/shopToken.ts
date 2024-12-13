import { Response } from "express";

const sendShopToken = (user: any, statusCode: number, res: Response): void => {
  const token = user.getJwtToken();
  res.cookie("seller_token", token, {
    httpOnly: true, // more secure
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "strict", // CSRF
  });
  return token;
};

export default sendShopToken;
