import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Typography, Box, Button, CircularProgress } from '@mui/material';
import BookCard from '../components/BookCard';
import { booksAPI } from '../services/api';

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
        
        const response = await booksAPI.getBooks(params);
        console.log('Explore books API response:', response);
        
        // Always initialize books as an array even when the response is unexpected
        if (response && response.data && Array.isArray(response.data)) {
          setBooks(response.data);
        } else {
          console.error('Expected an array in response.data but got:', response);
          setError('Unexpected response format from the server.');
          setBooks([]); // Ensure books is an empty array, not undefined or null
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
        setError('Failed to load books. Please try again.');
        setBooks([]); // Set empty array to avoid "map is not a function" error
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
        ) : Array.isArray(books) && books.length > 0 ? (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id || `book-${Math.random()}`}>
                <BookCard book={{
                  id: book._id,
                  title: book.title || 'Untitled',
                  author: book.author || 'Unknown Author',
                  genre: Array.isArray(book.genre) ? book.genre : ['Unknown'],
                  publication_year: book.publication_year || '',
                  description: book.description || 'No description available'
                }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No books found matching your criteria.</Typography>
        )}
      </Box>
    </Container>
  );
}

export default Explore;
