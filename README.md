# BookQuest - Book Recommendation System

## Overview

BookQuest is a full-stack web application that helps users discover, explore, review, and receive personalized recommendations for books. Built with a modern client-server architecture, it combines a React-based frontend with a Flask/MongoDB backend to deliver a responsive, secure, and scalable user experience.

---
## Project Structure

- **frontend/**: React application source
  - **src/**: Components, pages, services, and theme
  - **public/**: Static assets (HTML, manifest)
- **backend/**: Flask API server
  - **app.py**: Endpoints and main application logic
  - **config.py**: Configuration for database and security
  - **requirements.txt**: Python dependencies
- **config/**: Shared configuration (e.g., database connection helper)
- **json_files/**: Sample data for books, reviews, users (for development)
- **scripts/**: Utility scripts (e.g., database initialization)
- **ABOUT.md**: Project description and implementation details
- **README.md**: Setup instructions and usage guide

---
## Core Functionalities

### User Authentication

- **Register**: Users create accounts with name, email, and password. Passwords are hashed using Werkzeug’s `generate_password_hash` and stored securely.
- **Login**: Secure login with email/password, validated against hashed passwords. Successful login creates a Flask session cookie.
- **Logout**: Clears session cookie, ending the authenticated session.
- **Session Management**: Server-side sessions via Flask’s session object. Protected endpoints enforce login.

### Browse & Search Books

- **Home Page**: Showcase of popular or recently added books with quick-access cards.
- **Explore Page**: Full catalog browsing with live search (title/author keywords) and genre filtering.
- **Responsive Layout**: Adapts to various screen sizes, providing optimal grid columns.

### Book Details & Reviews

- **Detail View**: Displays comprehensive metadata (title, author, genres, publication year, description).
- **Reviews Section**: Lists all user reviews with reviewer names, star ratings, comments, and timestamps.
- **Add / Update Review**: Authenticated users can submit or edit reviews; average rating updates in real time.

### Personalized Recommendations

- **Content-Based Filtering**: Computes genre and author similarity using TF-IDF in Python.
- **Collaborative Filtering**: Calculates user-user similarity on rating matrix using cosine similarity.
- **Hybrid Engine**: Blends content and collaborative scores to generate top‑N recommended books.

### Review Management

- **Edit / Delete**: Users can modify or remove their reviews; backend enforces ownership checks.
- **Review History**: Chronological log of user reviews is displayed on the Profile page.

### User Profiles

- **Profile Dashboard**: Shows personal info, review history (“Books I Reviewed”), and recommendations.
- **Privacy Controls**: Option to mark profile public/private, controlling visibility of review history.

---
## Technologies Used

### Frontend

- **React.js**: Builds dynamic, component-driven UI.
- **Material-UI (MUI)**: Provides a consistent design system and responsive components.
- **Axios**: HTTP client for API communication with `withCredentials`.
- **React Router**: Manages client-side navigation in a single-page app.
- **LocalStorage / Context**: Stores user session locally for state management.

### Backend

- **Flask**: Lightweight Python framework for RESTful API.
- **PyMongo**: MongoDB driver for Python; supports aggregation pipelines.
- **Flask-CORS**: Enables cross-origin requests with session support.
- **Werkzeug**: Provides secure password hashing utilities.

### Database

- **MongoDB**: Document-oriented NoSQL database for flexible schemas.
  - **Collections**: `users`, `books`, `reviews`

---
## Database Schema

### users
- `_id`: ObjectId
- `name`: string
- `email`: string (unique)
- `password_hash`: string
- `created_at`: datetime

### books
- `_id`: ObjectId
- `title`: string
- `author`: string
- `genre`: array of strings
- `publication_year`: int
- `description`: string

### reviews
- `_id`: ObjectId
- `user_id`: ObjectId (ref `users`)
- `book_id`: ObjectId (ref `books`)
- `rating`: int (1–5)
- `comment`: string
- `created_at`: datetime

---
## Setup & Deployment

### Clone Repository

```bash
git clone https://github.com/yourusername/bookquest.git
cd bookquest
```

### Backend Setup

```bash
cd backend
python -m venv venv          # Optional virtual env
source venv/bin/activate     # macOS/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
flask run --port=5000        # Launch API server
```

### Seed Database

```bash
node scripts/init_db.js      # Populate MongoDB with sample data
```

### Frontend Setup

```bash
cd frontend
npm install
npm start                    # Launch React app at http://localhost:3000
```
