import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import userRouter from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import notesRouter from './routes/note.route.js';

dotenv.config();

// DB Connection
connectDB();

const app = express();

// Cookie Parser Middleware
app.use(cookieParser());
// Body Parser
app.use(express.json());


// APIS
app.use("/api/users", userRouter);
app.use("/api/notes", notesRouter);

const PORT = process.env.PORT || 9494;

// Server Setup
app.listen(PORT, ()=> {
  console.log(`Server is listening on ${PORT}`);
});


