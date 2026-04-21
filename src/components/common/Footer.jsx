// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const SOCIAL_LINKS = [
    { id: 'github', icon: FaGithub, url: 'https://github.com/johndoe', label: 'GitHub' },
    { id: 'linkedin', icon: FaLinkedin, url: 'https://linkedin.com/in/johndoe', label: 'LinkedIn' },
    { id: 'twitter', icon: FaTwitter, url: 'https://twitter.com/johndoe', label: 'Twitter' },
    { id: 'instagram', icon: FaInstagram, url: 'https://instagram.com/johndoe', label: 'Instagram' },
    { id: 'email', icon: FaEnvelope, url: 'mailto:john.doe@example.com', label: 'Email' }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Raafi Muhamad Fajar</h3>
            <p>Creating digital experiences that matter.</p>
          </div>
          
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <Link to="/projects">Projects</Link>
            <Link to="/certificates">Certificates</Link>
            <Link to="/contact">Contact</Link>
          </div>
          
          <div className="footer-social">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;