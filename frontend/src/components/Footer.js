import { Box, Container, Typography, Link } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" gutterBottom>
          BookRec
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          © {new Date().getFullYear()} BookRec. All rights reserved.
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          <Link href="#" color="inherit">Privacy Policy</Link>
          {' | '}
          <Link href="#" color="inherit">Terms of Service</Link>
          {' | '}
          <Link href="#" color="inherit">Contact Us</Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
