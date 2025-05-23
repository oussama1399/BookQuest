import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Rating, Button, TextField, Box, CircularProgress, Divider, Avatar } from '@mui/material';
import { booksAPI } from '../services/api';

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookData = await booksAPI.getBook(id);
        setBook(bookData);
      } catch (error) {
        console.error('Failed to fetch book details:', error);
        setError('Could not load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleSubmitReview = async () => {
    // In a real app, you'd get the user ID from authentication
    // This is a simplified example
    const userId = "user_placeholder_id"; 
    try {
      await api.submitReview({  // Changed from api.addReview to api.submitReview
        user_id: userId,
        book_id: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      // Refresh book data to include the new review using correct API method
      const updatedBook = await booksAPI.getBook(id); // Changed from api.getBookById
      setBook(updatedBook);
      
      // Reset form
      setNewReview({ rating: 0, comment: '' });
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" color="error">{error}</Typography>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5">Book not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4">{book.title}</Typography>
        <Typography variant="h6">By {book.author}</Typography>
        <Typography>Genre: {book.genre.join(', ')}</Typography>
        <Typography>Published: {book.publication_year}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>{book.description}</Typography>
      </Paper>

      {/* Add review section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">Add Your Review</Typography>
        <Rating 
          value={newReview.rating}
          onChange={(_, value) => setNewReview({...newReview, rating: value})}
          sx={{ mt: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Write your review..."
          value={newReview.comment}
          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          sx={{ mt: 2 }}
        />
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={handleSubmitReview}
          disabled={newReview.rating === 0}
        >
          Submit Review
        </Button>
      </Paper>
    </Container>
  );
}

export default BookDetail;
