import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Chat from './components/Chat';

import Navbar from './components/landing/Navbar';
import Register from './components/register';
import LandingPage from './components/landingpage';
import Exercise from './components/ExcerciseCard'; // Direct import
import Login from './components/login';
import About from './components/about.jsx';
import Chat from './components/Chat.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';


const App = () => {
  const [exercises, setExercises] = useState('');

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path="/about" element={<About />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/chat" element={<Chat setExercises={setExercises} />} />
      </Routes>
    </Router>
    </GoogleOAuthProvider>
     
  )
}

export default App
