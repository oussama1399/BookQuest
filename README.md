
# Book Recommendation System : BookQuest

This project is a book recommendation application built with a Flask & MongoDB backend and a React frontend.

## Overview

The project is split into three main parts:
- **Backend** – A Flask REST API that handles user authentication, book retrieval, and review submission.
- **Frontend** – A React application using Material‑UI (MUI) components for an interactive user interface.
- **Database Initialization** – A Node.js script that seeds MongoDB with initial data from JSON files.

## Recent Updates

- **Frontend Improvements:**
  - Fixed repeatedly occurring errors with the Material‑UI `Button` component by adjusting the import statements in various components (e.g. Navbar, BookCard, and pages).
  - Enhanced theme and styling using a custom `theme.js` and global styles in `index.css`.
  - Updated routing structure in `App.js` to support new pages such as `BookDetails`, `Explore`, and `Profile`.
  - Enhanced component interactivity in `Navbar.js` with proper user state handling and redirection after actions (login, logout, registration).

- **Backend Enhancements:**
  - Improved user registration and login endpoints:
    - Registration now saves the user's name, email, and hashed password.
    - Login endpoint searches by email (or username, if provided) and returns complete user details.
  - Added review submission functionality with proper ObjectId mapping and average rating updates.
  - Introduced robust error handling and logging in API routes.
  - Updated the health check endpoint to confirm an active connection with MongoDB.

- **Database Initialization:**
  - The database initialization script (`scripts/init_db.js`) now reads JSON files for users, books, and reviews, converts dates correctly, and hashes user passwords using bcrypt.
  - Reviews are now linked to users and books via ObjectIds; missing references are logged and skipped.

## Project Structure

- **/backend**  
  - `app.py`: Main API routes including book retrieval, user management, and review submissions.
  - `config.py`: Configuration settings including MongoDB URI and secret keys.
  - `requirements.txt`: Python dependencies used by the backend.
  - `init_db.js`: Node.js script to initialize and seed the MongoDB database.

- **/json_files**  
  Contains JSON data files to be imported into the database:
  - `books.json`
  - `users.json`
  - `reviews.json`

- **/frontend**  
  Contains the React application:
  - `src/`: Source code with pages, components, services (e.g., API functions in `api.js`), and theme customization (`theme.js`).
  - `public/`: Public assets, including `index.html` and `manifest.json`.
  - `package.json`: Lists React dependencies and build scripts.

- **Root Files**  
  Includes overall configurations such as the root `package.json` for backend dependencies (e.g., MongoDB and bcrypt).

## Setup and Deployment

### Prerequisites

Make sure you have the following installed:
- **MongoDB** (running at `mongodb://localhost:27017/`)
- **Node.js and npm**
- **Python (version 3.8 or later)**

### Installation Steps

1. **Clone the Repository:**
   ```bash
   git clone [<repository-url>](https://github.com/oussama1399/BookQuest)
   cd projet
   ```

2. **Backend Setup:**
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - (Optional) Create a Python virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate   # Unix/macOS
     venv\Scripts\activate      # Windows
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Start the Flask server:
     ```bash
     python app.py
     ```
   - The backend API will run on `http://localhost:5000`.

3. **Database Initialization:**
   - From the project root, run the initialization script:
     ```bash
     node scripts/init_db.js
     ```
   - This will seed the `BookRecDB` with initial users, books, and reviews.

4. **Frontend Setup:**
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install Node.js dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm start
     ```
   - The React app will run on `http://localhost:3000`.

## Summary of Functionality

- **User Management:**  
  - Registration (`/api/auth/register`) saves full user information.
  - Login (`/api/auth/login`) supports authentication with email (or username) and returns user details.
  - Logout (`/api/auth/logout`) clears the session.

- **Books and Reviews:**  
  - Retrieve books (`/api/books`) with optional filtering (genre and search query).
  - View book details including reviews (`/api/books/<book_id>`).
  - Submit reviews (`/api/reviews`) which update the book's average rating.

- **Health Check:**  
  - A dedicated endpoint (`/api/health`) ensures the backend and MongoDB are operational.

## Running the Application

After completing the setup steps, you can access the application by visiting `http://localhost:3000` in your web browser.
>>>>>>> 99ae3fe (initial commit)
