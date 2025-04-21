import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Typography, Box, Button, CircularProgress } from '@mui/material';
import BookCard from '../components/BookCard';
import api from '../services/api';

function Explore() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [genre, setGenre] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params = {};
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        if (genre) {
          params.genre = genre;
        }
        
        const data = await api.getBooks(params);
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, genre]);

  const handleSearch = () => {
    // The search will be triggered by the useEffect
    // Just update the URL for bookmarking purposes
    const newUrl = `/explore${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Explore Books</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search books"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Genre</InputLabel>
            <Select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Fiction">Fiction</MenuItem>
              <MenuItem value="Adventure">Adventure</MenuItem>
              <MenuItem value="Classic">Classic</MenuItem>
              <MenuItem value="Fantasy">Fantasy</MenuItem>
              <MenuItem value="Dystopian">Dystopian</MenuItem>
              <MenuItem value="Young Adult">Young Adult</MenuItem>
              <MenuItem value="Historical Fiction">Historical Fiction</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ height: '100%' }}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ minHeight: '200px' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : books.length === 0 ? (
          <Typography>No books found matching your criteria.</Typography>
        ) : (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id}>
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
      </Box>
    </Container>
  );
}

export default Explore;
