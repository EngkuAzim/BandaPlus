import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './Landing';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Profile from './Profile';
import LaporAduan from './LaporAduan';
import StatusAduan from './StatusAduan';
import UrusAduan from './UrusAduan';

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
        <Route path="/profil" element={<Profile />} />
        <Route path="/lapor-aduan" element={<LaporAduan />} />
        <Route path="/sejarah" element={<StatusAduan />} />
        <Route path="/urus-aduan" element={<UrusAduan />} />
      </Routes>
    </>
  );
}

export default App;