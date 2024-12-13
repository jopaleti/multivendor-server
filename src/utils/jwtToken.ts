import { Response } from "express";

const sendToken = (user: any, statusCode: number, res: Response): string => {
  const token: string = user.getJwtToken();

  res.cookie("token", token, {
    httpOnly: true, // more secure
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "strict", // CSRF
  });

  return token;
};

export default sendToken;
