import { start } from "repl";
import Product from "../model/Product.js";
import asyncHandler from "express-async-handler";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";

export const createProductCtrl = asyncHandler(async (req, res) => {
  const images = req.files.map((file)=>file.path);

  const {
    name,
    description,
    brand,
    category,
    sizes,
    colors,
    user,
    price,
    totalQty,
  } = req.body;

  const productExists = await Product.findOne({ name });
  if (productExists) {
    throw new Error("Product is Already Present");
  }

  //find category
  const categoryFound = await Category.findOne({
    name: { $regex: category, $options: "i" },
  });
  if (!categoryFound) {
    throw new Error("Category Not Found PLease create Category");
  }

  //find color

  const BrandFound = await Brand.findOne({
    name: { $regex: brand, $options: "i" },
  });
  if (!BrandFound) {
    throw new Error("Brand Not Found PLease create Brand");
  }

  const product = await Product.create({
    name,
    description,
    category,
    sizes,
    brand,
    colors,
    user: req.userAuthId,
    price,
    totalQty,
    images:images
  });

  //push the prduct into category
  //ye hmne category m product array bnayi h usme daal rhe h
  categoryFound.products.push(product._id);
  await categoryFound.save();

  //push the prduct into brand
  //ye hmne brand m product array bnayi h usme daal rhe h
  BrandFound.products.push(product._id);
  await BrandFound.save();

  res.json({
    status: "success",
    message: "Product Successfully Created",
    product,
  });
});

export const fetchProductsCtrl = asyncHandler(async (req, res) => {
  let productQuery = Product.find();
  //search by name
  if (req.query.name) {
    productQuery = productQuery.find({
      name: { $regex: req.query.name, $options: "i" },
    });
  }
  //filter by brand
  if (req.query.brand) {
    productQuery = productQuery.find({
      brand: { $regex: req.query.brand, $options: "i" },
    });
  }

  //filter by category
  if (req.query.category) {
    productQuery = productQuery.find({
      category: { $regex: req.query.category, $options: "i" },
    });
  }

  //filter by color
  if (req.query.color) {
    productQuery = productQuery.find({
      colors: { $regex: req.query.color, $options: "i" },
    });
  }

  //filter by size
  if (req.query.size) {
    productQuery = productQuery.find({
      sizes: { $regex: req.query.size, $options: "i" },
    });
  }
  //filter by price range
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    //gte: greater or equal
    //lte: less than or equal to
    productQuery = productQuery.find({
      price: { $gte: priceRange[0], $lte: priceRange[1] },
    });
  }

  //pagination
  //page
  const page = parseInt(req.query.page) ? req.query.page : 1;
  //limit
  const limit = parseInt(req.query.limit) ? req.query.limit : 10;
  //startindex
  const startIndex = (page - 1) * limit;
  //endindex
  const endIndex = page * limit;
  //total
  const total = await Product.countDocuments();

  productQuery = productQuery.skip(startIndex).limit(limit);

  //pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  const products = await productQuery.populate("reviews");

  res.json({
    status: "success",
    total,
    results: products.length,
    pagination,
    message: "Products fetched Successfully",
    products,
  });
});

export const getProductCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const product = await Product.findById(id).populate("reviews");
  if (!product) {
    throw new Error("Product is Not Present");
  }

  res.json({
    status: "success",
    message: "Product fetch Successfully",
    product,
  });
});

export const updateProductCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const {
    name,
    description,
    brand,
    category,
    sizes,
    colors,
    user,
    price,
    totalQty,
  } = req.body;

  const newProduct = await Product.findByIdAndUpdate(
    id,
    {
      name,
      description,
      brand,
      category,
      sizes,
      colors,
      user,
      price,
      totalQty,
    },
    {
      new: true,
    }
  );

  res.json({
    status: "success",
    message: "Product Update Successfully",
    newProduct,
  });
});
export const deleteProductCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;

  await Product.findByIdAndDelete(id);

  res.json({
    status: "success",
    message: "Product Deleted Successfully",
  });
});
