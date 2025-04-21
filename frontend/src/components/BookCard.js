import React from 'react';
import { Card, CardContent, Typography, CardActionArea, Rating, Box, Chip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function BookCard({ book }) {
  const [elevated, setElevated] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (book.id) {
      navigate(`/book/${book.id}`);
    }
  };

  return (
    <CardActionArea onClick={handleClick}>
      <Card
        className="fade-in"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: elevated ? '0 12px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={() => setElevated(true)}
        onMouseLeave={() => setElevated(false)}
        style={{ textDecoration: 'none' }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            gap: 0.5,
          }}
        >
          {book.genre && book.genre.slice(0, 1).map((g, index) => (
            <Chip
              key={index}
              label={g}
              size="small"
              color="primary"
              sx={{ opacity: 0.9 }}
            />
          ))}
        </Box>
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {book.title || 'Book Title'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {book.author || 'Author Name'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, mb: 1 }}
            >
              {book.publication_year ? `Published: ${book.publication_year}` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Rating value={book.rating || 4} readOnly precision={0.5} size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {book.rating || 4}/5
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </CardActionArea>
  );
}

export default BookCard;
