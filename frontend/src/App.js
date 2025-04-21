import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Box component="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Box>
        <Footer />
      </div>
    </Router>
  );
}

export default App;