import express from 'express';
const productRouter= express.Router();
import { createProductCtrl, deleteProductCtrl, fetchProductsCtrl, getProductCtrl, updateProductCtrl } from '../controllers/productCtrl.js';
import { isLoggedIn } from '../middlewares/isLoggedIn.js';
import upload from '../config/fileUpload.js';
import isAdmin from '../middlewares/isAdmin.js';


productRouter.post("/",isLoggedIn,upload.array('files'),isAdmin,createProductCtrl);

productRouter.get("/",fetchProductsCtrl);
productRouter.get("/:id",getProductCtrl)
productRouter.put("/:id",isLoggedIn,isAdmin,updateProductCtrl);
productRouter.delete("/:id",isLoggedIn,isAdmin,deleteProductCtrl)




export default productRouter