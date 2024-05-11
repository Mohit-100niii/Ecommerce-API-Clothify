import express from "express";
import dotenv from "dotenv";
import dbConnect from "../config/dbConnect.js";
import userRouter from "../routes/usersRoute.js";
import { globalErrhandler, notFound } from "../middlewares/globalErrHandler.js";
import productRouter from "../routes/productRoute.js";
import categoriesRouter from "../routes/categoryRoute.js";
import brandsRouter from "../routes/brandRoute.js";
import colorRouter from "../routes/colorRoute.js";
import ReviewRouter from "../routes/reviewRoute.js";
import orderRouter from "../routes/orderRoute.js";
dotenv.config();
import Stripe from "stripe";
import Order from "../model/Order.js";
import couponsRouter from "../routes/couponRoute.js";

const app = express();
dbConnect();
//Stripe Webhook

const stripe = new Stripe(process.env.STRIPE_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.END_POINT;
  // "whsec_49efeec8b943723b2ddd55d6e735c35327e8515b8a15f7b4ef09eb5b5dfd0bbd";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    // switch (event.type) {
    //   case 'payment_intent.succeeded':
    //     const paymentIntentSucceeded = event.data.object;
    //     // Then define and call a function to handle the event payment_intent.succeeded
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    if (event.type === "checkout.session.completed") {
      //update the order
      const session = event.data.object;
      const { orderId } = session.metadata;
      const paymentStatus = session.payment_status;
      const paymentMethod = session.payment_method_types[0];
      const totalAmount = session.amount_total;
      const currency = session.currency;

      //find the order
      const order = await Order.findByIdAndUpdate(JSON.parse(orderId), {
        totalPrice: totalAmount / 100,
        currency,
        paymentMethod,
        paymentStatus,
      },{
        new:true
      });
    
    } else {
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/brands", brandsRouter);
app.use("/api/v1/colors", colorRouter);
app.use("/api/v1/review", ReviewRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/coupons/", couponsRouter);

//err middlewear
app.use(notFound);
app.use(globalErrhandler);



export default app;
