import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

export const isLoggedIn = (req, res, next) => {
  //get token from header
  const token = getTokenFromHeader(req);
  //verify token
  const user = verifyToken(token);
  //save the user
  if (!user) {
    throw new Error("Expired/Invalid Token Please Login Again");
  } else {
    req.userAuthId = user?.id;
    next();
  }
};
