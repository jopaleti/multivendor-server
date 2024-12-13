import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";

// Defining the interface for the Address
interface Address {
  country: string;
  city: string;
  address1: string;
  address2: string;
  zipCode: number;
  addressType: string;
}

// Defining the interface for the Avatar
interface Avatar {
  public_id: string;
  url: string;
}

// Defining the interface for the userSchema
interface userInterface extends Document {
  username: string;
  firstname?: string;
  lastname?: string;
  otp?: string;
  email: string;
  password: string;
  confirm_password?: string;
  phoneNumber?: number;
  addresses?: Address[];
  role: string;
  avatar?: Avatar;
  createdAt: Date;
  resetPasswordToken?: string;
  resetPasswordTime?: Date;
  getJwtToken: () => string;
  comparePassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, "Please enter your username!"],
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  otp: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  confirm_password: {
    type: String,
    minLength: [4, "Password should be greater than 4 characters"],
  },
  phoneNumber: {
    type: Number,
  },
  addresses: [
    {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      zipCode: {
        type: Number,
      },
      addressType: {
        type: String,
      },
    },
  ],
  role: {
    type: String,
    default: "user",
  },
  avatar: {
    public_id: {
      type: String,
      default: 1,
      //   required: true,
    },
    url: {
      type: String,
      default: "",
      //   required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
userSchema.pre<userInterface>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  // Generate hashed password for the user
  const salt: any = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT token
userSchema.methods.getJwtToken = function (this: userInterface): string {
  const JWT_SECRET_KEY: any = process.env.JWT_SECRET_KEY;
  // const JWT_EXPIRES: any = process.env.JWT_EXPIRES;
  return jwt.sign({ id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

// Compare the password
userSchema.methods.comparePassword = async function (
  this: userInterface,
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
