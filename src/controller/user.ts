import { Request, Response, NextFunction } from "express";
import User from "../model/user";
import ErrorHandler from "../utils/ErrorHandler";
import asyncMiddleware from "../middleware/catchAsyncErrors";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import sendToken from "../utils/jwtToken";
import sendMail from "../utils/sendMail";

// Configure the cloudinary SDK
cloudinary.config({
  cloud_name: "dogutd5fs",
  api_key: "559464456645496",
  api_secret: "tO1vqhVZ9WhsnchvlLhP1Mwmkig",
});

// Create user
const createUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, avatar, role } = req.body;
      const userEmail = await User.findOne({ email });

      if (userEmail) {
        return next(new ErrorHandler("User already exists", 400));
      }
      var myCloud: any;
      if (avatar && avatar != "") {
        myCloud = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
        });
      }

      // Console log the mycloud
      console.log(myCloud);

      const user = {
        username: username,
        email: email,
        password: password,
        avatar: {
          public_id: (myCloud && myCloud.public_id) || "",
          url: (myCloud && myCloud.secure_url) || "",
        },
        role: role ? role : "user",
      };

      // Activation token creation
      const activationToken = createActivationToken(user);
      const activationUrl = `http://localhost:${process.env.PORT}/${activationToken}`;

      try {
        //   Code goes here...
        const newUser = await User.create(user);
        console.log(newUser);
        // Code for mailing user for account confirmation goes here...

        //   await sendMail({
        //     email: user.email,
        //     subject: "Activate your account",
        //     message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
        //   });

        //   res.status(201).json({
        //     success: true,
        //     message: `please check your email:- ${user.email} to activate your account!`,
        //   });
        sendToken(newUser, 201, res);
        res.status(201).json({
          success: true,
          message: "Account has been created successfully",
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
const createActivationToken = (user: any) => {
  const ACTIVATION_SECRET: any = process.env.ACTIVATION_SECRET;
  return jwt.sign({ user: user }, ACTIVATION_SECRET, { expiresIn: "1h" });
};

const login = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user: any = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      const token = sendToken(user, 201, res);
      res.status(200).json({
        success: true,
        user,
        token,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 *Logout
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const logout = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("token", null, {
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

/**
 *Update user info
 * @param {object} req, email, firstname, lastname, phonenumber/telephone/fax
 * @param {object} res
 * @returns {object} success message
 */
const updateUserInfo = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, phoneNumber, firstname, lastname } = req.body;

      const existedUser = await User.findOne({ email });
      if (existedUser) {
        return next(
          new ErrorHandler("User with this email already exists", 400)
        );
        //   return res.status(400).json("User existed")
      }
      const user: any = await User.findById((req as any).user.id);

      user.email = email ? email : user.email;
      user.phoneNumber = phoneNumber ? phoneNumber : user.phoneNumber;
      user.firstname = firstname ? firstname : user.firstname;
      user.lastname = lastname ? lastname : user.lastname;

      await user.save();

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 *Update user password
 * @param {object} req, newPassword, confirm_password
 * @param {object} res
 * @returns {object} success message
 */
const updateUserPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: any = await User.findById((req as any).user.id).select(
        "+password"
      );

      if (req.body.newPassword !== req.body.confirm_password) {
        return next(
          new ErrorHandler("Password doesn't matched with each other!", 400)
        );
      }

      user.password = req.body.newPassword;
      user.confirm_password = req.body.confirm_password;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 *Update user address
 * @param {object} req, email, firstname, lastname, phonenumber/telephone/fax
 * @param {object} res
 * @returns {object} success message
 */

const updateUserAddress = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: any = await User.findById((req as any).user.id);

      const sameTypeAddress = user.addresses.find(
        (address: any) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(
            `${req.body.addressType} address already exists`,
            409
          )
        );
      }

      const existsAddress = user.addresses.find(
        (address: any) => address._id === req.body._id
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 *Delete user address
 * @param {object} req,
 * @param {object} res
 * @returns {object} success message
 */

const deleteUserAddress = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user._id;
      const addressId = req.params.id;

      await User.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//  Update the avatar
const updateAvatar = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let existsUser: any = await User.findById((req as any).user.id);

      if (req.body.avatar !== "") {
        const imageId = existsUser.avatar.public_id;

        imageId && (await cloudinary.uploader.destroy(imageId));

        const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
          public_id: "olympic_flag",
        });

        existsUser.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await existsUser.save();

      res.status(200).json({
        success: true,
        user: existsUser,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Reset password
const resetPassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const email: any = req.body.email;
      // Frontend url to enter the token
      const enterTokenUrl: any = req.body.url;

      const userExist: any = await User.findOne({ email });
      if (!userExist) {
        return next(
          new ErrorHandler("User with this email doesn't exist", 404)
        );
      }

      // Generate otp
      const otp = await otpGenerator();
      console.log(otp);
      const activationOtp = createActivationOtp(otp);
      console.log(activationOtp);
      const activationUrl = `http://localhost:8000/api/v1/user/reset-activation/${activationOtp}`;
      // Updating the user otp field in the database
      userExist.otp = otp;
      await userExist.save();

      console.log({ ActivationOtp: activationOtp });
      try {
        await sendMail({
          email: email,
          subject: "OTP for resetting password",
          message: `Hello ${userExist.username},your otp code is ${otp}. ${
            enterTokenUrl
              ? `Please click on the link to reset your password: ${activationUrl}`
              : ""
          }`,
        });

        res.status(201).json({
          success: true,
          message: `please check your email:- ${userExist.email} to reset your password!`,
          otpToken: activationOtp,
          activationUrl: activationUrl,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

const otpGenerator = async () => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// create activation token
const createActivationOtp = (otp: any) => {
  const ACTIVATION_SECRET: any = process.env.ACTIVATION_SECRET;
  return jwt.sign({ otp: otp }, ACTIVATION_SECRET, { expiresIn: "1h" });
};

// Reset password confirmation
const resetActivation = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp, newPassword } = req.body;
      const otpToken = req.params.otpToken;

      const ACTIVATION_SECRET: any = process.env.ACTIVATION_SECRET;
      const decodedOtp: any = jwt.verify(otpToken, ACTIVATION_SECRET);
      if (!decodedOtp && decodedOtp.otp != otp) {
        return res
          .status(401)
          .json("Invalid reset otp or otp code has expired!");
      }

      // Get user and update the password and confirm password field with otp code
      const user = await User.findOne({ otp: decodedOtp.otp });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      user.password = newPassword;
      user.confirm_password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Delete user by the admin
const deleteUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: any = await User.findById(req.params.id);
      if (!user) {
        return next(
          new ErrorHandler("User is not available with this id", 400)
        );
      }
      const imageId = user.avatar.public_id;
      imageId && (await cloudinary.uploader.destroy(imageId));

      await User.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Get all users by the admin
const getAllUsers = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// Export the routes
export {
  createUser,
  login,
  logout,
  updateUserInfo,
  updateUserPassword,
  updateUserAddress,
  deleteUserAddress,
  updateAvatar,
  resetActivation,
  resetPassword,
  deleteUser,
  getAllUsers,
};
