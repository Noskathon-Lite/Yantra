import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Navbar from './components/landing/Navbar';
import LandingPage from './components/landingpage';

function App() {
  

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
      </Routes>
    </Router>
    
     
  )
}

export default App
