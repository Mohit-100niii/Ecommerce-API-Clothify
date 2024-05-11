import { createReviewCtrl } from "../controllers/reviewCtrl.js";
import express from 'express';
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const ReviewRouter=express.Router();


ReviewRouter.post("/:productID",isLoggedIn,createReviewCtrl);

export default ReviewRouter;