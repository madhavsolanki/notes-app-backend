import express from "express";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import {
  createNoteController,
  deleteNotesController,
  getAllNotesController,
  updateNotesController,
} from "../controllers/notes.controller.js";

const notesRouter = express.Router();

// User routes
notesRouter.route("/create-note").post(authenticateUser, createNoteController);
notesRouter.route("/get-all").get(authenticateUser, getAllNotesController);
notesRouter.route("/update/:id").put(authenticateUser, updateNotesController);
notesRouter
  .route("/delete/:id")
  .delete(authenticateUser, deleteNotesController);

export default notesRouter;
