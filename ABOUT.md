# BookQuest: Comprehensive Book Recommendation System

BookQuest is a full‑stack web application designed to help readers discover, explore, and review books, while providing personalized recommendations based on user activity and content analysis. Built with a React/MUI front end and a Flask/MongoDB back end, BookQuest offers a modern, responsive, and interactive reading experience.

---
## Core Functionalities

1. **User Authentication & Profiles**
   - **Register / Login / Logout**: Secure account creation and session management with hashed passwords and HTTP-only cookies.
   - **Profile Dashboard**: View personal information (name, email, join date) and your complete review history under “Books I Reviewed.”
   - **Protected Actions**: Only authenticated users can submit, edit, or delete their own reviews.

2. **Browse, Search & Filter Books**
   - **Home Page**: Showcase of popular or recently added books with quick access cards.
   - **Explore Page**: Full catalog browsing with live search (title/author keywords) and genre filtering.
   - **Pagination & Responsiveness**: Adapts to mobile, tablet, and desktop, providing 1–3 column layouts for optimal readability.

3. **Book Details & Reviews**
   - **Detail View**: Comprehensive book metadata (title, author, genre tags, publication year, description).
   - **Reviews Section**: Displays all user reviews with author names, star ratings, comments, and timestamps.
   - **Add / Update Review**: Registered users can submit a new review (1–5 stars + comment) or update an existing one. Ratings instantly recalculate the book’s average.

4. **Personalized Recommendations**
   - **Hybrid Engine**: Combines content‑based filtering (genre, author similarity via TF‑IDF) and collaborative filtering (user rating patterns, cosine similarity matrix).
   - **Dynamic Suggestions**: “Recommended for You” lists on Profile and Home, updating as users submit more reviews.

5. **Review Management**
   - **Edit & Delete**: Users may modify or remove their reviews, with server‑side authorization checks.
   - **Review History**: Chronological log of all reviews written by the user, linked back to each book’s detail page.

---
## Technical Architecture

- **Frontend**
  - React 18, React Router for SPA navigation
  - Material‑UI (MUI) for theming, responsive layouts, and accessibility
  - Axios for API communication with `withCredentials=true` for secure sessions
  - Context/LocalStorage for lightweight user state management

- **Backend**
  - Flask REST API with Blueprint routes for modularity
  - Flask‑CORS for cross‑origin resource sharing with session support
  - PyMongo for MongoDB interactions, employing aggregation pipelines for data lookup and projection
  - Session management via Flask’s built‑in cookies and secret key

- **Database**
  - MongoDB collections: `users`, `books`, `reviews`
  - Schemas:
    - `users`: stores name, email, hashed password, join date
    - `books`: metadata, summary, optional `avg_rating`
    - `reviews`: references to user_id and book_id, rating, comment, timestamp

---
## Setup & Deployment

1. **Backend**
   ```bash
   cd backend
   python -m venv venv            # Optional virtual environment
   source venv/bin/activate       # macOS/Linux
   venv\Scripts\activate        # Windows
   pip install -r requirements.txt
   flask run --port=5000          # Starts the API server
   ```

2. **Database Seeding**
   ```bash
   node scripts/init_db.js        # Populates MongoDB with sample data
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start                      # Launches React dev server on http://localhost:3000
   ```

---
## Testing & Maintenance

- **Linting & Formatting**: ESLint + Prettier (recommended setup) for consistent code style.
- **Error Logging**: Backend logs critical paths; frontend uses `console.error` for dev diagnostics.
- **Scalability**: Modular services and routes allow easy integration of new features (e.g., social login, advanced recommendations).

---
*Updated: April 26, 2025*

*