import { useState, useEffect } from 'react';
import { Container, Typography, Grid, TextField, Box, Button, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookCard from '../components/BookCard';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';

function Home() {
  const [popularBooks, setPopularBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch real books from the API
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await booksAPI.getBooks();
        console.log('API response for getBooks:', response);
        if (Array.isArray(response.data)) {
          setPopularBooks(response.data);
        } else {
          console.error('Expected an array but got:', response);
          setError('Unexpected response format from the server.');
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container>
      <div className="hero-section">
        <Typography variant="h2" className="pulse">Discover Your Next Favorite Book</Typography>
        <Box sx={{ 
          display: 'flex', 
          maxWidth: '700px', 
          mx: 'auto',
          mt: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.2)',
          p: 0.5
        }}>
          <TextField
            fullWidth
            placeholder="Search books by title, author, or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            sx={{ 
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: 'transparent' },
                '&.Mui-focused fieldset': { borderColor: 'transparent' },
              }
            }}
          />
          <Button 
            variant="contained" 
            sx={{ ml: 1, minWidth: '120px' }}
            onClick={handleSearch}
          >
            <SearchIcon sx={{ mr: 1 }} />
            Search
          </Button>
        </Box>
      </div>
      
      <Typography variant="h4" className="fade-in section-1">Popular Books</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <Grid container spacing={3} className="fade-in section-2">
          {popularBooks.slice(0, 6).map((book, index) => (
            <Grid item xs={12} sm={6} md={4} key={book._id} sx={{ 
              animationDelay: `${0.1 + index * 0.1}s` 
            }}>
              <BookCard book={{
                id: book._id,
                title: book.title,
                author: book.author,
                genre: book.genre,
                publication_year: book.publication_year,
                description: book.description
              }} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Home;
