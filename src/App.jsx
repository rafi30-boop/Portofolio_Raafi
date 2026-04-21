// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LandingPage from "./pages/LandingPage";
import Certificates from "./pages/Certificates";
import CertificateDetail from "./pages/CertificateDetail"; // Tambahkan import
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import CV from "./pages/CV";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/admin/AdminRoute";


import "./styles/globals.css";
import "./styles/components/button.css";
import "./styles/components/card.css";
import "./styles/components/navbar.css";
import "./styles/components/modal.css";
import "./styles/components/input.css";
import "./styles/pages/landing-page.css";


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/certificates/:id" element={<CertificateDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;