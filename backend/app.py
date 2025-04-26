from flask import Flask, jsonify, request, session
from flask_cors import CORS
from config import MONGO_URI, DATABASE_NAME, SECRET_KEY
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import json
from werkzeug.security import generate_password_hash, check_password_hash
import re
from bson.errors import InvalidId

app = Flask(__name__)
app.secret_key = SECRET_KEY
CORS(app, supports_credentials=True)

# MongoDB client setup with connection options for stability
client = MongoClient(MONGO_URI, 
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000, 
                    socketTimeoutMS=5000)
db = client[DATABASE_NAME]

# Check DB connection at startup
try:
    client.admin.command('ping')
    collections = db.list_collection_names()
    print(f"MongoDB connection: SUCCESS - Connected to {DATABASE_NAME}")
    print(f"Available collections: {collections}")
except Exception as e:
    print(f"MongoDB connection: FAILED - {str(e)}")
    print("Please ensure MongoDB is running and accessible.")

# Helper class to convert ObjectId to string
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

# Health check endpoint
@app.route('/api/health')
def health():
    try:
        client.admin.command('ping')
        db.list_collection_names()
        return jsonify({'status': 'ok', 'database': DATABASE_NAME})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# User registration
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        name = data.get('name')               # Added: get name
        email = data.get('email')
        password = data.get('password')
        if not name or not email or not password:
            return jsonify({'error': 'Name, email and password are required'}), 400

        # Check if email already exists
        if db.users.find_one({'email': email}):
            return jsonify({'error': f'Email "{email}" already exists. Please log in instead.'}), 409

        hashed_pw = generate_password_hash(password)
        # Store the name as well
        user = {'name': name, 'email': email, 'password': hashed_pw, 'created_at': datetime.now()}
        result = db.users.insert_one(user)
        return jsonify({'message': 'User registered successfully', 'user_id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# User login
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        # Allow login with either 'username' or 'email'
        identifier = data.get('username') or data.get('email')  # Use one variable
        password = data.get('password')
        
        if not identifier or not password:
            return jsonify({'error': 'Email and password required'}), 400
            
        # Find user by email (registration stores email, not username)
        user = db.users.find_one({'email': identifier})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
            
        session['user_id'] = str(user['_id'])
        return jsonify({
            'message': 'Login successful',
            'user_id': str(user['_id']),
            'name': user.get('name'),
            'email': user.get('email')
        })
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Logout
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'})

# Check if username exists
@app.route('/api/auth/check-username/<username>', methods=['GET'])
def check_username(username):
    user = db.users.find_one({'username': username})
    return jsonify({'exists': user is not None})

# Get user profile
@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        # Convert string ID to ObjectId
        user_obj_id = ObjectId(user_id)
        
        # Find user by ID (exclude password field)
        user = db.users.find_one({'_id': user_obj_id}, {'password': 0})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Convert ObjectId to string
        user['_id'] = str(user['_id'])
        
        return jsonify(user)
        
    except InvalidId:
        return jsonify({'error': 'Invalid user ID format'}), 400
    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Get reviews for a user
@app.route('/api/users/<user_id>/reviews', methods=['GET'])
def get_user_reviews(user_id):
    try:
        from bson.errors import InvalidId
        user_obj_id = ObjectId(user_id)
    except InvalidId:
        return jsonify({'error': 'Invalid user ID format'}), 400
    reviews = list(db.reviews.find({'user_id': user_obj_id}))
    result = []
    for rev in reviews:
        book = db.books.find_one({'_id': rev['book_id']})
        result.append({
            'review_id': str(rev['_id']),
            'book_id': str(rev['book_id']),
            'rating': rev['rating'],
            'comment': rev.get('comment', ''),
            'created_at': rev.get('created_at').isoformat() if rev.get('created_at') else None,
            'book': {
                'title': book.get('title') if book else None,
                'author': book.get('author') if book else None,
                'cover_url': book.get('cover_url') if book else None
            }
        })
    return jsonify(result), 200

# Get all books with optional filtering
@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        # Get query parameters
        genre = request.args.get('genre')
        search = request.args.get('search')
        
        # Build query
        query = {}
        if genre:
            query['genre'] = genre
        if search:
            query['$or'] = [
                {'title': {'$regex': search, '$options': 'i'}},
                {'author': {'$regex': search, '$options': 'i'}}
            ]
        
        # Execute query
        books = list(db.books.find(query))
        
        # Convert ObjectId to string
        serialized_books = json.loads(JSONEncoder().encode(books))
        return jsonify(serialized_books), 200
        
    except Exception as e:
        print(f"Get books error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Get a specific book by ID
@app.route('/api/books/<book_id>', methods=['GET'])
def get_book(book_id):
    try:
        print(f"Fetching book with ID: {book_id}")
        
        # Validate and convert book_id to ObjectId
        if not book_id or len(book_id) != 24:
            return jsonify({"error": "Invalid book ID format"}), 400
            
        try:
            book_id_obj = ObjectId(book_id)
        except InvalidId:
            return jsonify({"error": "Invalid book ID"}), 400

        # Find book by ID
        book = db.books.find_one({"_id": book_id_obj})
        
        if not book:
            return jsonify({"error": "Book not found"}), 404
            
        print(f"Book found: {book.get('title', 'Unknown')}")
            
        # Convert ObjectId to string
        book_data = json.loads(JSONEncoder().encode(book))
        
        # Add reviews for this book
        reviews = list(db.reviews.aggregate([
            {'$match': {'book_id': book_id_obj}},
            {'$lookup': {
                'from': 'users',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'user'
            }},
            {'$unwind': {'path': '$user', 'preserveNullAndEmptyArrays': True}},
            {'$project': {
                'rating': 1,
                'comment': 1,
                'created_at': 1,
                'user_name': {'$ifNull': ['$user.name', 'Anonymous']}
            }}
        ]))
        
        book_data['reviews'] = json.loads(JSONEncoder().encode(reviews))
        
        return jsonify(book_data), 200
        
    except Exception as e:
        print(f"Error in get_book: {str(e)}")
        return jsonify({"error": f"Failed to fetch book details: {str(e)}"}), 500

# Submit a review for a book
@app.route('/api/reviews', methods=['POST'])
def create_review():
    try:
        data = request.json
        print(f"Received review data: {data}")
        
        # Check if user is authenticated
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Validate review data
        book_id = data.get('book_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not book_id or not rating:
            return jsonify({'error': 'Book ID and rating are required'}), 400
        
        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be an integer between 1 and 5'}), 400
        
        # Create review document with proper ObjectId conversion
        try:
            review = {
                'user_id': ObjectId(user_id),
                'book_id': ObjectId(book_id),
                'rating': rating,
                'comment': comment,
                'created_at': datetime.now()
            }
        except InvalidId:
            return jsonify({'error': 'Invalid user_id or book_id format'}), 400
        
        # Check if user has already reviewed this book
        existing_review = db.reviews.find_one({
            'user_id': ObjectId(user_id),
            'book_id': ObjectId(book_id)
        })
        
        if existing_review:
            # Update existing review
            db.reviews.update_one(
                {'_id': existing_review['_id']},
                {'$set': {
                    'rating': rating,
                    'comment': comment,
                    'updated_at': datetime.now()
                }}
            )
            result_id = existing_review['_id']
            message = 'Review updated successfully'
        else:
            # Insert new review
            result = db.reviews.insert_one(review)
            result_id = result.inserted_id
            message = 'Review submitted successfully'
        
        # Update book's average rating
        try:
            all_reviews = list(db.reviews.find({'book_id': ObjectId(book_id)}))
            if all_reviews:
                avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
                db.books.update_one(
                    {'_id': ObjectId(book_id)},
                    {'$set': {'avg_rating': round(avg_rating, 1)}}
                )
        except Exception as e:
            print(f"Error updating book rating: {str(e)}")
        
        return jsonify({
            'message': message,
            'review_id': str(result_id)
        }), 201
        
    except Exception as e:
        print(f"Error creating review: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Get reviews for a book
@app.route('/api/books/<book_id>/reviews', methods=['GET'])
def get_book_reviews(book_id):
    try:
        # Convert string ID to ObjectId
        try:
            book_id_obj = ObjectId(book_id)
        except InvalidId:
            return jsonify({'error': 'Invalid book ID format'}), 400
        
        # Find reviews for this book
        reviews = list(db.reviews.find({'book_id': book_id_obj}))
        
        # Add username to each review
        for review in reviews:
            review['_id'] = str(review['_id'])
            review['book_id'] = str(review['book_id'])
            review['user_id'] = str(review['user_id'])
            
            # Get username
            user = db.users.find_one({'_id': ObjectId(review['user_id'])})
            review['username'] = user['name'] if user else 'Anonymous'
            
            # Format datetime
            if 'created_at' in review:
                review['created_at'] = review['created_at'].isoformat()
                
        return jsonify(reviews)
        
    except Exception as e:
        print(f"Error getting book reviews: {str(e)}")
        return jsonify({'error': str(e)}), 500

# --- Collaborative Filtering Functions and Endpoint ---
def recommend_books_for_user(user_id, num_recs=5):
    # Simple genre-based recommendation: find user's favorite genres and suggest books from those
    try:
        user_obj = ObjectId(user_id)
    except:
        return []
    # Get user's high-rated reviews (4 or 5 stars)
    user_reviews = list(db.reviews.find({'user_id': user_obj, 'rating': {'$gte': 4}}))
    if not user_reviews:
        return []
    # Count genre occurrences
    genre_count = {}
    for rev in user_reviews:
        book = db.books.find_one({'_id': rev['book_id']})
        if book and isinstance(book.get('genre'), list):
            for g in book['genre']:
                genre_count[g] = genre_count.get(g, 0) + 1
    if not genre_count:
        return []
    # Sort genres by preference
    top_genres = sorted(genre_count, key=genre_count.get, reverse=True)
    # Find books in top genres excluding ones already reviewed
    reviewed_ids = {rev['book_id'] for rev in user_reviews}
    recs = []
    for genre in top_genres:
        if len(recs) >= num_recs:
            break
        # Fetch candidate books
        candidates = db.books.find({'genre': genre})
        for book in candidates:
            if book['_id'] in reviewed_ids:
                continue
            recs.append({
                '_id': str(book['_id']),
                'title': book.get('title'),
                'author': book.get('author'),
                'genre': book.get('genre'),
                'publication_year': book.get('publication_year'),
                'cover_url': book.get('cover_url')
            })
            if len(recs) >= num_recs:
                break
    return recs

@app.route('/api/recommendations/user/<user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    recs = recommend_books_for_user(user_id)
    return jsonify(recs), 200

# DEVELOPMENT ONLY - Delete all users (protect this in production!)
@app.route('/api/dev/clear-users', methods=['POST'])
def clear_users():
    # For safety, require a confirmation header
    if request.headers.get('X-Confirm-Action') != 'DELETE_ALL_USERS':
        return jsonify({'error': 'Missing confirmation header'}), 403
    result = db.users.delete_many({})
    return jsonify({
        'message': 'All users deleted',
        'count': result.deleted_count
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
