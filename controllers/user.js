import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import SuccessHandler from '../utils/successHandler.js';
import { User } from "../models/zuser.js";
import { sendToken } from "../utils/sendToken.js";
import {sendEmail} from '../utils/sendEmail.js';
import crypto from 'crypto';

export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password || !phone || !address)
        return next(new ErrorHandler("Please enter all field", 400));

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User Already Exist", 409));

    user = await User.create({
        name,
        email,
        password,
        phone,
        address
    });

  sendToken(res, user, "Registered Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ErrorHandler("Please enter all field", 400));
  
    const user = await User.findOne({ email }).select("+password");
  
    if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));
  
    const isMatch = await user.comparePassword(password);
  
    if (!isMatch)
      return next(new ErrorHandler("Incorrect Email or Password", 401));
  
    sendToken(res, user, `Welcome back, ${user.name}`, 200);
  });


  export const loadUser = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
      user: req.user
    })
  });

  export const logout = catchAsyncError(async (req,res,next) => {
    const options = {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: false,
      // sameSite: "none",
    };

    res.status(200).cookie("token",'', options).json({
      success: true,
      message: "Logout Successfully"
    });
  });

  export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `Click on the link to reset your password. ${url}. If you have not request then please ignore.`;
    // Send token via email
    await sendEmail(user.email, "zafraan.eu Reset Password", message);

    next(new SuccessHandler(`Reset Token has been sent to ${user.email}`,200));
  });


  export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
  
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });
  
    if (!user)
      return next(new ErrorHandler("Token is invalid or has been expired", 401));
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save();
  
    next(new SuccessHandler("Password Changed Successfully",200));
  });