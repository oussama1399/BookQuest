import axios from 'axios';

// API base URL - make sure this matches your backend
const API_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

api.getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to parse user data from localStorage:', error);
    return null;
  }
};

// Auth API services
const authAPI = {
  // Register new user
  register: (userData) => api.post('/api/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // Logout user
  logout: () => api.post('/api/auth/logout'),
  
  // Get current user profile
  getProfile: (userId) => api.get(`/api/users/${userId}`),
  getUserReviews: (userId) => api.get(`/api/users/${userId}/reviews`)
};

// Books API services
const booksAPI = {
  // Get all books with optional filters
  getBooks: (params) => api.get('/api/books', { params }),
  
  // Get a specific book by ID
  getBook: (bookId) => api.get(`/api/books/${bookId}`),
  
  // Get reviews for a specific book
  getBookReviews: (bookId) => api.get(`/api/books/${bookId}/reviews`),
  
  // Submit a review
  submitReview: (reviewData) => api.post('/api/reviews', reviewData)
};

export { authAPI, booksAPI, api };
