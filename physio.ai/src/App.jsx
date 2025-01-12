import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Chat from './components/Chat';

import Navbar from './components/landing/Navbar';
import Login from './components/login';
import Register from './components/register';
import LandingPage from './components/landingpage';
import Exercise from './components/ExcerciseCard'; // Direct import
import About from './components/about'; // Direct import

import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  const [exercises, setExercises] = useState('');

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
 
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          
          <Route path="/exercise" element={<Exercise />} />
        
          <Route path="/about" element={<About />} />
          
         
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;