import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress } from '@mui/material';
import BookCard from '../components/BookCard';

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUserInfo({
        name: "John Doe",
        email: "john.doe@example.com",
        registration_date: "2023-01-15"
      });
      
      setUserReviews([
        { 
          id: 1, 
          rating: 5, 
          comment: "A truly inspiring book!",
          book: { title: "The Alchemist", author: "Paulo Coelho" }
        },
        {
          id: 2,
          rating: 4,
          comment: "A disturbing but thought-provoking read.",
          book: { title: "1984", author: "George Orwell" }
        }
      ]);
      
      setRecommendations([
        { id: 1, title: "The Hobbit", author: "J.R.R. Tolkien", genre: ["Fantasy"], rating: 4.6 },
        { id: 2, title: "Harry Potter", author: "J.K. Rowling", genre: ["Fantasy"], rating: 4.9 },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        {userInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography><strong>Name:</strong> {userInfo.name}</Typography>
            <Typography><strong>Email:</strong> {userInfo.email}</Typography>
            <Typography><strong>Member since:</strong> {new Date(userInfo.registration_date).toLocaleDateString()}</Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>My Reviews</Typography>
      <Grid container spacing={3}>
        {userReviews.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography>You haven't written any reviews yet.</Typography>
            </Paper>
          </Grid>
        ) : (
          userReviews.map(review => (
            <Grid item xs={12} key={review.id}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">{review.book.title}</Typography>
                <Typography variant="subtitle1">by {review.book.author}</Typography>
                <Typography><strong>Rating:</strong> {review.rating}/5</Typography>
                <Typography sx={{ mt: 1 }}>{review.comment}</Typography>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
      
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>Recommended for You</Typography>
      <Grid container spacing={3}>
        {recommendations.map(book => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Profile;
