// src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
// Hapus import Navbar jika ada

const MainLayout = () => {
  return (
    <div className="main-layout">
      {/* Hapus Navbar dari sini */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;