// src/components/admin/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

// Set true untuk mengaktifkan akses admin, false untuk menonaktifkan
const ADMIN_ACCESS = true;

// Atau bisa menggunakan password sederhana
// const ADMIN_PASSWORD = 'admin123'; // Bisa disesuaikan

const AdminRoute = ({ children }) => {
  // Cara 1: Langsung izinkan akses
  if (!ADMIN_ACCESS) {
    return <Navigate to="/" replace />;
  }

  // Cara 2: Menggunakan sessionStorage (opsional)
  // const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  // if (!isAdmin) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default AdminRoute;