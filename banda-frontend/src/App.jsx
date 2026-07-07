import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './Landing';
import Register from './Register';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Dashboard from './components/Dashboard';
import Profile from './Profile';
import LaporAduan from './LaporAduan';
import StatusAduan from './StatusAduan';
import UrusAduan from './UrusAduan';
import UrusPengguna from './UrusPengguna';
import PetaKluster from './PetaKluster';
import TetapanSistem from './TetapanSistem';
import ArahanKerja from './ArahanKerja';
import LogBajet from './LogBajet';
import LaporanTugasan from './LaporanTugasan';
import LaporanPrestasi from './LaporanPrestasi';
import SenaraiPembaikan from './SenaraiPembaikan';
import ProtectedRoute from './components/ProtectedRoute';

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/lapor-aduan" element={<ProtectedRoute><LaporAduan /></ProtectedRoute>} />
        <Route path="/sejarah" element={<ProtectedRoute><StatusAduan /></ProtectedRoute>} />
        <Route path="/urus-aduan" element={<ProtectedRoute><UrusAduan /></ProtectedRoute>} />
        <Route path="/urus-pengguna" element={<ProtectedRoute><UrusPengguna /></ProtectedRoute>} />
        <Route path="/peta-kluster" element={<ProtectedRoute><PetaKluster /></ProtectedRoute>} />
        <Route path="/tetapan" element={<ProtectedRoute><TetapanSistem /></ProtectedRoute>} />
        <Route path="/arahan-kerja" element={<ProtectedRoute><ArahanKerja /></ProtectedRoute>} />
        <Route path="/laporan-prestasi" element={<ProtectedRoute><LaporanPrestasi /></ProtectedRoute>} />
        <Route path="/laporan-tugasan" element={<ProtectedRoute><LaporanTugasan /></ProtectedRoute>} />
        <Route path="/bajet" element={<ProtectedRoute><LogBajet /></ProtectedRoute>} />
        <Route path="/pembaikan" element={<ProtectedRoute><SenaraiPembaikan /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;