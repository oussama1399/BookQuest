import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// User management
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || "null");
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// Authentication
async function register(userData) {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

async function login(credentials) {
  // Try sending both email and username if unsure
  const payload = {
    email: credentials.email,
    username: credentials.email, // fallback if backend expects username
    password: credentials.password,
  };
  try {
    const response = await axios.post('/api/auth/login', payload, { withCredentials: true });
    setCurrentUser(response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid credentials. Please check your email and password.');
    }
    throw error;
  }
}

async function logout() {
  await api.post('/auth/logout');
  clearCurrentUser();
}

async function checkUsername(username) {
  const response = await api.get(`/auth/check-username/${username}`);
  return response.data;
}

// Server health check
async function checkServerHealth() {
  const response = await api.get('/health');
  return response.data;
}

// Books
async function getBooks(params = {}) {
  const response = await api.get('/books', { params });
  return response.data;
}

async function getBook(id) {
  const response = await api.get(`/books/${id}`);
  return response.data;
}

// Reviews
async function getBookReviews(bookId) {
  const response = await api.get(`/books/${bookId}/reviews`);
  return response.data;
}

async function submitReview(reviewData) {
  const response = await api.post('/reviews', reviewData);
  return response.data;
}

// Export all functions
export default {
  api,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  register,
  login,
  logout,
  checkUsername,
  getBooks,
  getBook,
  getBookReviews,
  submitReview,
  checkServerHealth
};
