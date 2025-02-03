import Note from "../models/notes.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

// Create Notes Controller

export const createNoteController = async (req, res) => {
  const { title, content } = req.body;

  const newNote = new Note({
    title,
    content,
    author: req.user._id,
  });

  // Push note ID to user's notes array
  await User.findByIdAndUpdate(req.user._id, {
    $push: { notes: newNote._id },
  });

  try {
    const savedNote = await newNote.save();

    // Populate the Author Field with Only Full name
    const populateNote = await savedNote.populate("author", "fullName");

    res.status(201).json({ success: true, data: savedNote });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllNotesController = async (req, res) => {
  try {
    const notes = await Note.find().populate("author", "fullName");
    return res.status(200).json({ success: true, data: notes });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const updateNotesController = async (req, res) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;

    // Validate if noteId is a valid MongoDB ObjectId **BEFORE** querying
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Note ID" });
    }

    const note = await Note.findById(noteId);

    if (!note) {
      return res
        .status(404)
        .json({ success: false, message: "Note Not Found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    const updatedNote = await note.save();

    if (!updatedNote) {
      return res.status(500).json({
        success: false,
        message: "Failed to Update Note",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note Updated Successfully",
      data: updatedNote,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server error:" });
  }
};

export const deleteNotesController = async (req, res) => {
  try {
    const noteId = req.params.id;

   // Validate if noteId is a valid MongoDB ObjectId **BEFORE** querying
   if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Note ID" });
  }

    const note = await Note.findById(noteId);
    if(!note){
      return res.status(404).json({ success: false, message: "Note Not Found" });
    }

    const deletedNote = await note.deleteOne();
    if (!deletedNote) {
      return res.status(500).json({ success: false, message: "Failed to Delete Note" });
    }
    res.status(200).json({ success: true, message: "Note Deleted Successfully" });

  } catch (error) {
    console.log(error);
    
    return res.status(500).json({ success: false, message:"Internal Server error" });
  }
};
