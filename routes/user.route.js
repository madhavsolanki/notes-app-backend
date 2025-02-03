import express from "express";
import {
  deleteUserAccoutController,
  loginController,
  logoutController,
  registerController,
  updateUserController,
} from "../controllers/user.controller.js";
import { validateRegistration } from "../middlewares/validateRegistration.middleware.js";
import { validateLogin } from "../middlewares/validateLogin.middleware.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";

const userRouter = express.Router();

userRouter.route("/register").post(validateRegistration, registerController);
userRouter.route("/login").post(validateLogin, loginController);
userRouter.route("/update").put(authenticateUser, updateUserController);
userRouter.route("/logout").post(logoutController);
userRouter.route("/delete").delete(authenticateUser, deleteUserAccoutController);

export default userRouter;
