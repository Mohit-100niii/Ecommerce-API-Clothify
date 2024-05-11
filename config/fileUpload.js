import multer from "multer";
import cloudinaryPackage from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const cloudinary = cloudinaryPackage.v2;

//configure cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//create storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormat: ["jpg", "png", "jpeg"],
  params: {
    folder: "Ecommerce-Clothify",
  },
});

//init multer with storage engine
const upload = multer({
  storage,
});

export default upload;
