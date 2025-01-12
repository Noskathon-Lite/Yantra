import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Navbar from './components/landing/Navbar';
import LandingPage from './components/landingpage';
import About from './components/about'; 
import Exercise from './components/ExcerciseCard'; // Direct import
import Login from './components/login';

function App() {
  
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
