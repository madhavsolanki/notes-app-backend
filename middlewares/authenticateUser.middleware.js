import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const authenticateUser = async (req, res, next) => {
  try {

    const token = req.cookies.token;

    if(!token){
      return res.status(401).json({
        success: false,
        error: "Authentication Required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find User and Exclude Password
    const user =  await User.findById(decoded.userId).select('-password');

    if(!user){
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Attach to request object 
    req.user = user;
    next();

  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};
