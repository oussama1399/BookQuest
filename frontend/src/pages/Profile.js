import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Alert, Card, CardActionArea, CardContent, CardActions, Tooltip, Rating } from '@mui/material';
import BookCard from '../components/BookCard';
import { api, authAPI, booksAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user info from local storage
        const currentUser = api.getCurrentUser();
        
        if (!currentUser) {
          setError('Not logged in. Please log in to view your profile.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        setUserInfo(currentUser);

        // Fetch actual reviews the user has written
        try {
          const userId = currentUser.user_id || currentUser._id || currentUser.id;
          if (userId) {
            const resp = await authAPI.getUserReviews(userId);
            if (resp && resp.data) {
              setUserReviews(resp.data);
            }
          }
        } catch (reviewError) {
          console.error('Failed to fetch user reviews:', reviewError);
        }
        
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

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

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4">My Profile</Typography>
        {userInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography><strong>Name:</strong> {userInfo.name}</Typography>
            <Typography><strong>Email:</strong> {userInfo.email}</Typography>
            <Typography><strong>Member since:</strong> {
              userInfo.created_at 
                ? new Date(userInfo.created_at).toLocaleDateString() 
                : new Date().toLocaleDateString() 
            }</Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>Books I Reviewed</Typography>
      {userReviews.length === 0 ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography>You haven't written any reviews yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {userReviews.map((review) => (
            <Grid item xs={12} sm={6} md={4} key={review.review_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', ':hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => navigate(`/book/${review.book_id}`)} sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.2rem' } }}>
                      {review.book.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      by {review.book.author}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <Tooltip title={`${review.rating} of 5 stars`} arrow>
                        <Rating value={review.rating} readOnly size="small" />
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {review.comment}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {recommendations && recommendations.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>Recommended for You</Typography>
          <Grid container spacing={3}>
            {recommendations.map((book, index) => (
              <Grid item xs={12} sm={6} md={4} key={book._id || `rec-${index}`}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}

export default Profile;
