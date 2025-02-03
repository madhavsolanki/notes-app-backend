# Notes Application Backend

This is the backend of a Notes Application built with Node.js, Express, and MongoDB. The application allows users to register, log in, create, update, delete, and view their notes. Each note is associated with a user, and their notes can be fetched and managed securely.

## Features

- **User Authentication**: JWT-based authentication with secure login/logout functionality.
- **CRUD Operations for Notes**:
  - Create a note with title and content.
  - Read (view) all notes created by the authenticated user.
  - Update and delete notes.
- **User Profile Management**: Users can update their profile information.
- **Security**: Passwords are hashed using bcrypt, and sensitive data like passwords are excluded from the response.
- **MongoDB Integration**: Uses MongoDB to store user and note data.

## Tech Stack

- **Node.js**: JavaScript runtime used to build the backend.
- **Express**: Web framework for Node.js used to build RESTful APIs.
- **MongoDB**: NoSQL database used to store user and note data.
- **Mongoose**: ODM (Object Data Modeling) library to interact with MongoDB.
- **JWT**: Used for authentication and generating tokens.
- **bcrypt**: Used for hashing passwords.
