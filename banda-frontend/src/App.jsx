import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './Landing';
import LandingPageV2 from './LandingPageV2';
import Register from './Register';
import Login from './Login';
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

function App() {
  return (
    // We use a React Fragment (<>) to group multiple elements without adding an extra DOM node
    <>
      {/* Toaster goes OUTSIDE the Routes component */}
      <Toaster position="top-center" richColors />

      {/* Routes only contains Route components */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/v2" element={<LandingPageV2 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/lapor-aduan" element={<LaporAduan />} />
        <Route path="/sejarah" element={<StatusAduan />} />
        <Route path="/urus-aduan" element={<UrusAduan />} />
        <Route path="/urus-pengguna" element={<UrusPengguna />} />
        <Route path="/peta-kluster" element={<PetaKluster />} />
        <Route path="/tetapan" element={<TetapanSistem />} />
        <Route path="/arahan-kerja" element={<ArahanKerja />} />
        <Route path="/laporan-prestasi" element={<LaporanPrestasi />} />
        <Route path="/laporan-tugasan" element={<LaporanTugasan />} />
        <Route path="/bajet" element={<LogBajet />} />
        <Route path="/pembaikan" element={<SenaraiPembaikan />} />
      </Routes>
    </>
  );
}

export default App;