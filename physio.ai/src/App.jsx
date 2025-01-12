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

const App = () => {
  const [exercises, setExercises] = useState('');

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path="/about" element={<About />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat setExercises={setExercises} />} />
      </Routes>
    </Router>
    
     
  )
}

export default App
