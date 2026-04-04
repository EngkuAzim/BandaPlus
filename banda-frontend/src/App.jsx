import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Register from './Register';
import Login from './Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;