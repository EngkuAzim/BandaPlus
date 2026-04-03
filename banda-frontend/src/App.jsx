import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Redirect empty path to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Define paths for Register and Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* You can add a Dashboard route here later */}
        <Route path="/dashboard" element={<h2>Selamat Datang ke Dashboard BANDA+</h2>} />
      </Routes>
    </div>
  );
}

export default App;