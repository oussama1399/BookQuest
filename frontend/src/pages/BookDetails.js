import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Rating, Button, TextField, Box, CircularProgress, Divider, Avatar, Alert, Chip } from '@mui/material';
import api from '../services/api';

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const user = api.getCurrentUser();
    setCurrentUser(user);

    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        setError('');

        // Validate the book ID
        if (!id || id.length !== 24) {
          console.error('Invalid book ID format:', id);
          throw new Error('Invalid book ID format');
        }

        console.log('Fetching book details for ID:', id);
        const data = await api.getBook(id);
        console.log('Fetched book details:', data);
        
        if (!data) {
          throw new Error('No book data received');
        }
        
        setBook(data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError(err.message || 'Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const handleSubmitReview = async () => {
    if (!currentUser) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    try {
      if (newReview.rating === 0) {
        setError('Please select a rating');
        return;
      }
      
      await api.submitReview({
        user_id: currentUser._id, // Fixed user_id reference
        book_id: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      // Refresh book data to include the new review
      const updatedBook = await api.getBook(id);
      setBook(updatedBook);
      
      // Reset form
      setNewReview({ rating: 0, comment: '' });
      setError('');
    } catch (error) {
      console.error('Failed to submit review:', error);
      setError('Failed to submit review. Please try again later.');
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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!book) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Book not found</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>{book.title || 'No Title Available'}</Typography>
        <Typography variant="h6" gutterBottom>By {book.author || 'Unknown Author'}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {book.genre && book.genre.length > 0 ? (
            book.genre.map((g, index) => (
              <Chip key={index} label={g} color="primary" />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No genres available</Typography>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Published: {book.publication_year || 'Unknown Year'}
        </Typography>
        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          {book.description || 'No description available.'}
        </Typography>
      </Paper>

      {/* Reviews section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Reviews</Typography>
        
        {book.reviews && book.reviews.length > 0 ? (
          book.reviews.map((review, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2 }}>{review.user_name?.charAt(0) || '?'}</Avatar>
                <Box>
                  <Typography variant="subtitle1">{review.user_name || 'Anonymous'}</Typography>
                  <Rating value={review.rating} readOnly size="small" />
                </Box>
              </Box>
              <Typography variant="body1">{review.comment || 'No comment provided.'}</Typography>
              <Typography variant="caption" color="text.secondary">
                {review.review_date ? new Date(review.review_date).toLocaleDateString() : 'Unknown date'}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>No reviews yet. Be the first to review!</Typography>
        )}
      </Paper>

      {/* Add review section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Add Your Review</Typography>
        {!currentUser && (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Please <a href="/login" style={{ textDecoration: 'underline' }}>login</a> to leave a review
          </Alert>
        )}
        <Rating 
          value={newReview.rating}
          onChange={(_, value) => setNewReview({...newReview, rating: value})}
          sx={{ mt: 2 }}
          disabled={!currentUser}
        />
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Write your review..."
          value={newReview.comment}
          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          sx={{ mt: 2 }}
          disabled={!currentUser}
        />
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={handleSubmitReview}
          disabled={!currentUser || newReview.rating === 0}
        >
          Submit Review
        </Button>
      </Paper>
    </Container>
  );
}

export default BookDetails;
