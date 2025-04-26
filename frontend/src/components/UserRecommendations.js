import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardActionArea, CardMedia, CardContent } from '@mui/material';
import { booksAPI } from '../services/api';
import './UserRecommendations.css';

function UserRecommendations({ userId }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecs() {
      try {
        const resp = await booksAPI.getUserRecommendations(userId);
        setBooks(resp.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchRecs();
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!books.length) return <Typography>No personalized recommendations yet.</Typography>;

  return (
    <Box className="user-recommendations-section" sx={{ my: 4 }}>
      <Typography variant="h5" gutterBottom>Recommended Books for You</Typography>
      <Grid container spacing={2}>
        {books.map(book => (
          <Grid item xs={12} sm={6} md={4} key={book._id}>
            <Card className="book-card">
              <CardActionArea>
                {book.cover_url && (
                  <CardMedia component="img" height="180" image={book.cover_url} alt={book.title} />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>{book.title}</Typography>
                  <Typography variant="body2" color="text.secondary">by {book.author}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default UserRecommendations;