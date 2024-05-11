import express from 'express'
import {
    createCategoryCtrl,
  deleteCategoryCtrl,
  getAllCategoriesCtrl,
  getSingleCategoryCtrl,
  updateCategoryCtrl,
} from "../controllers/categoryCtrl.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import categoryFileupload from '../config/categoryUpload.js';
import isAdmin from '../middlewares/isAdmin.js';



const categoriesRouter = express.Router();

categoriesRouter.post(
  "/",
  isLoggedIn,isAdmin,categoryFileupload.single('file'),
  createCategoryCtrl
);
categoriesRouter.get("/", getAllCategoriesCtrl);
categoriesRouter.get("/:id", getSingleCategoryCtrl);
categoriesRouter.delete("/:id",isLoggedIn,isAdmin, deleteCategoryCtrl);
categoriesRouter.put("/:id",isLoggedIn,isAdmin, updateCategoryCtrl);
export default categoriesRouter;
