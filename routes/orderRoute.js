import express from 'express';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import { createOrderCtrl, getAllOrderCtrl, getOrderStatsCtrl, getSingleOrderCtrl, updateOrderCtrl } from '../controllers/orderCtrl.js';
import isAdmin from '../middlewares/isAdmin.js';

const orderRoute=express.Router();

orderRoute.post("/",isLoggedIn,createOrderCtrl);
orderRoute.get("/",isLoggedIn,getAllOrderCtrl);
orderRoute.get("/:id",isLoggedIn,getSingleOrderCtrl);
orderRoute.post("/update/:id",isLoggedIn,updateOrderCtrl);
orderRoute.get("/sales/stats",isLoggedIn,isAdmin,getOrderStatsCtrl)


export default orderRoute;