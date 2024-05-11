import Order from "../model/Order.js";
import asyncHandler from "express-async-handler";
import User from "../model/User.js";
import Product from "../model/Product.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import Coupon from "../model/Coupon.js";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_KEY);

export const createOrderCtrl = asyncHandler(async (req, res) => {
  const { coupon } = req?.query;

  const couponFound = await Coupon.findOne({
    code: coupon?.toUpperCase(),
  });

  if (couponFound?.isExpired) {
    throw new Error("Coupon has Expired");
  }

  // if (!couponFound) {
  //   throw new Error("Coupon Not Exits");
  // }
  const discount = couponFound?.discount / 100;


  const { orderItems, shippingAddress, totalPrice } = req.body;

  const user = await User.findById(req.userAuthId);

  // Check if user has shipping address
  if (!user?.hasShippingAddress) {
    throw new Error("Please provide shipping address");
  }
  //Check if order is not empty
  if (orderItems?.length <= 0) {
    throw new Error("No Order Items");
  }
  //Place/create order - save into DB
  const order = await Order.create({
    user: user?._id,
    orderItems,
    shippingAddress,
    totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
    // totalPrice
    
  });

  //Update the product qty

  const products = await Product.find({ _id: { $in: orderItems } });

  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });

  //push order into user
  user.orders.push(order?._id);
  await user.save();

  //update product quantity
  //-------------------------------------------------
  //make payment to stripe
  //convert order item to have same structure that need
  const convertedOrder = orderItems.map((item) => {
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: item?.name,
          description: item?.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrder,
    metadata: {
      orderId: JSON.stringify(order?._id),
    },
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  res.json({ url: session.url });
  // res.json({
  //   success: true,
  //   msg: "Order Controller",
  //   order,
  //   user,
  // });
});

export const getAllOrderCtrl = asyncHandler(async (req, res) => {
  const orders = await Order.find();
  res.json({
    success: true,
    message: "All Orders",
    orders,
  });
});

export const getSingleOrderCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const order = await Order.findById(id);

  res.json({
    success: true,
    message: "Single Product Fetch successfuly",
    order,
  });
});

export const updateOrderCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updatedorder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.json({
    success: true,
    message: "Order Updated",
    updatedorder,
  });
});



export const getOrderStatsCtrl = asyncHandler(async (req, res) => {
  //get order stats
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: "$totalPrice",
        },
        totalSales: {
          $sum: "$totalPrice",
        },
        maxSale: {
          $max: "$totalPrice",
        },
        avgSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);
  //get the date
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);
  //send response
  res.status(200).json({
    success: true,
    message: "Sum of orders",
    orders,
    saleToday,
  });
});