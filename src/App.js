import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Tabs, Tab, Container, Box } from '@mui/material';
import Calculator from "./component/calculator"; // Import the Calculator component
import Home from "./component/home"; // Create a simple Home component as an example


// About Tab Component
function About() {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4">About Me</Typography>
      <Typography variant="body1" sx={{ marginTop: '10px' }}>
        I am Jay Zhao, a passionate developer. This site showcases my work, ideas, and more.
      </Typography>
    </Box>
  );
}

// Projects Tab Component
function Projects() {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4">My Projects</Typography>
      <Typography variant="body1" sx={{ marginTop: '10px' }}>
        Here are some of the cool projects I've worked on:
        <ul>
          <li>Project 1: React Personal Website</li>
          <li>Project 2: Mobile App</li>
          <li>Project 3: Digital Meal Planner</li>
        </ul>
      </Typography>
    </Box>
  );
}

// Contact Tab Component
function Contact() {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4">Contact Me</Typography>
      <Typography variant="body1" sx={{ marginTop: '10px' }}>
        Feel free to reach out to me at <strong>jayzhao@example.com</strong>.
      </Typography>
    </Box>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Jay Zhao
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: '20px' }}>
        <Tabs
          value={window.location.pathname}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Home" value="/" component={Link} to="/" />
          <Tab label="Calculator" value="/calculator" component={Link} to="/calculator" />
          <Tab label="About" value="/about" component={Link} to="/about" />
          <Tab label="Projects" value="/projects" component={Link} to="/projects" />
          <Tab label="Contact" value="/contact" component={Link} to="/contact" />
        </Tabs>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
