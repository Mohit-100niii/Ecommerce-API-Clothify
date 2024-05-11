import Product from "../model/Product.js";
import Review from "../model/Review.js";
import asyncHandler from "express-async-handler";

export const createReviewCtrl = asyncHandler(async (req, res) => {
  const id = req.params.productID;
  const { product, message, rating } = req.body;

  const productFound = await Product.findById(id).populate("reviews");
  if (!productFound) {
    throw new Error("Product Not Found");
  }

  //check if user already review that product
  //yaha hmne reviews aaray m se user ko find kara agar h mtb vo dubara review
  //karna cha rha h
  const hasReviewed = productFound?.reviews?.find((review) => {
    return review?.user.toString() === req?.userAuthId.toString();
  });

  if (hasReviewed) {
    throw new Error("You have Already Reviewed this Product");
  }

  const review = await Review.create({
    message,
    rating,
    product: productFound?._id,
    user: req.userAuthId,
  });

  productFound.reviews.push(review?._id);
  await productFound.save();
  res.json({
    masg: "Review Created Successfully",
  });
});
