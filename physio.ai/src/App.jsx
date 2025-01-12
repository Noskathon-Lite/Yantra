import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Chat from './components/Chat';

import Navbar from './components/landing/Navbar';
import Login from './components/login';
import Register from './components/register';
import LandingPage from './components/landingpage';
import Exercise from './components/ExcerciseCard'; // Direct import
import Login from './components/login';

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
      </Routes>
    </Router>
    
     
  )
}

export default App
