import express from 'express';
import { getUserProfile, loginUserCtrl, registerUserCtrl, updateShippingAddressCtrl } from '../controllers/usersCtrl.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
const userRouter= express.Router();

userRouter.post("/register",registerUserCtrl);
userRouter.post("/login",loginUserCtrl);
userRouter.get("/profile",isLoggedIn, getUserProfile);
userRouter.put("/update/shipping",isLoggedIn,updateShippingAddressCtrl)



export default userRouter