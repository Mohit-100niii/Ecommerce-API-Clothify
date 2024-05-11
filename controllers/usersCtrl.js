import User from "../model/User.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
//@ user registration Register User
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

export const registerUserCtrl = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;
  //check if user exits;

  if (validator.isEmail(email) == false) {
    throw new Error("Please Enter Correct Email");
  }
  const userExits = await User.findOne({ email });
  if (userExits) {
    throw new Error("User Already Exists");
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    fullname,
    email,
    password: hashPassword,
  });
  res.status(201).json({
    status: "success",
    messsage: "User Register Successfully",
    data: user,
  });
});

export const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userFound = await User.findOne({ email });
  if (userFound && (await bcrypt.compare(password, userFound?.password))) {
    const token = generateToken(userFound._id);
    res.json({
      status: "success",
      msg: "User login Successfully",
      userFound,
      token,
    });
  } else {
    throw new Error("Invalid Login Credentials");
  }
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const token = getTokenFromHeader(req);
  //verify token
  const verified = verifyToken(token);
  const user = await User.findById(req.userAuthId).populate("orders");

  res.json({
    status: "success",
    message: "User Profile Fteched Sucessfully",
    user,
  });
});

export const updateShippingAddressCtrl = asyncHandler(async (req, res) => {
  const { firstname, lastname, address, city, postalCode, province, phone } =
    req.body;

  const user = await User.findById(
    req.userAuthId,
    {
      shippngAddress: {
        firstname,
        lastname,
        address,
        city,
        postalCode,
        province,
        phone,
      },
      hasShippingAddress: true,
    },
    {
      new: true,
    }
  );
  res.json({
    status: "success",
    message: "User Shipping Address Updated",
    user,
  });
});
