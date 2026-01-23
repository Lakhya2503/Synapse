import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AvailableScoialLogins, AvailableUserRoles, USER_TEMPORARY_TOKEN_EXPIRY, userLoginType, userRoleEnum } from '../constant.js'

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role : {
      type : String,
      enum : AvailableUserRoles,
      default : userRoleEnum.USER,
      required : true
    },
    OTP: {
      type: String,
      default : ""
    },
    loginType: {
      type: String,
      enum: AvailableScoialLogins,
      default: userLoginType.EMAIL_PASSWORD,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Methods
userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    email: this.email,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });
};

userSchema.methods.generateRefreshToken = function () {
  const payload = { _id: this._id };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY

  return { unHashedToken, hashedToken, tokenExpiry };
}

const User = model("User", userSchema);
export default User;
