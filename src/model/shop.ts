import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Defining the interface for the Avatar
interface Avatar {
  public_id: string;
  url: string;
}

// Interface for transactions
interface Transactions {
  amount?: number;
  status: string;
  created: Date;
  updatedAt: Date;
}

// Defining the interface for the shop model
interface ShopInterface extends Document {
  username: string;
  email: string;
  password: string;
  description?: string;
  address: string;
  phoneNumber: number;
  role: string;
  avatar?: Avatar;
  zipCode: number;
  withdrawMethod?: object;
  availableBalance: number;
  transactions?: Transactions[];
  createdAt: Date;
  resetPasswordToken?: string;
  resetPasswordTime?: Date;
  getJwtToken: () => string;
  comparePassword: (enteredPassword: string) => Promise<boolean>;
}

const shopSchema: Schema<ShopInterface> = new Schema({
  username: {
    type: String,
    required: [true, "Please enter your shop username!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    default: "Seller",
  },
  avatar: {
    public_id: {
      type: String,
      //   required: true,
    },
    url: {
      type: String,
      //   required: true,
    },
  },
  zipCode: {
    type: Number,
    required: true,
  },
  withdrawMethod: {
    type: Object,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        default: "Processing",
      },
      created: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
shopSchema.pre<ShopInterface>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  // Generate hashed password for the user
  const salt: any = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT token
shopSchema.methods.getJwtToken = function (this: ShopInterface): string {
  const JWT_SECRET_KEY: any = process.env.JWT_SECRET_KEY;
  // const JWT_EXPIRES: any = process.env.JWT_EXPIRES;
  return jwt.sign({ id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
};

// Compare the password
shopSchema.methods.comparePassword = async function (
  this: ShopInterface,
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Shop = mongoose.model<ShopInterface>("Shop", shopSchema);
export default Shop;
