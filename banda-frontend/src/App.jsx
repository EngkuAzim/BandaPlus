import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './Landing';
import LandingTest from './LandingTest';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    // We use a React Fragment (<>) to group multiple elements without adding an extra DOM node
    <>
      {/* Toaster goes OUTSIDE the Routes component */}
      <Toaster position="top-center" richColors />

      {/* Routes only contains Route components */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;