// src/components/common/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram, FaArrowUp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const SOCIAL_LINKS = [
    { id: 'github', icon: FaGithub, url: 'https://github.com/rafi30-boop', label: 'GitHub' },
    { id: 'linkedin', icon: FaLinkedin, url: 'https://www.linkedin.com/in/raafi-fajar-66b9793a5/', label: 'LinkedIn' },
    { id: 'instagram', icon: FaInstagram, url: 'https://www.instagram.com/raftssst/', label: 'Instagram' }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* Top Section: Name & Tagline */}
        <div className="footer-top">
          <div className="footer-name">
            <span>Raafi</span>
            <span>Muhamad</span>
            <span>Fajar</span>
          </div>
          <p className="footer-tagline">Creating digital experiences that matter.</p>
        </div>

        {/* Middle Section: Links in Rows */}
        <div className="footer-links-section">
          {/* Explore Row */}
          <div className="link-row">
            <span className="link-category">EXPLORE</span>
            <div className="link-items">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <Link to="/projects">Projects</Link>
              <Link to="/certificates">Certificates</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          {/* Resources Row */}
          <div className="link-row">
            <span className="link-category">RESOURCES</span>
            <div className="link-items">
              <a href="#">Blog</a>
              <a href="#">Guides</a>
              <a href="#">Support</a>
              <a href="#">Documentation</a>
            </div>
          </div>

          {/* Legal Row */}
          <div className="link-row">
            <span className="link-category">LEGAL</span>
            <div className="link-items">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
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
          
          <div className="footer-copyright">
            <p>&copy; {currentYear} Raafi Muhamad Fajar. All rights reserved.</p>
          </div>
          
          <button onClick={scrollToTop} className="back-to-top">
            <FaArrowUp />
            <span>Back to Top</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        /* ============================================ */
        /* Footer Styles - Sama dengan Home Page */
        /* ============================================ */
        
        .footer {
          background: #07070e;
          color: rgba(255, 255, 255, 0.8);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3rem 0 2rem;
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Background Orbs seperti di Hero Section */
        .footer::before {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%);
          pointer-events: none;
          border-radius: 50%;
        }

        .footer::after {
          content: '';
          position: absolute;
          top: -100px;
          left: -100px;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.06), transparent 70%);
          pointer-events: none;
          border-radius: 50%;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        /* Top Section */
        .footer-top {
          text-align: center;
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-name {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 2px;
          color: white;
        }

        .footer-name span {
          position: relative;
        }

        .footer-name span:not(:last-child)::after {
          content: '';
          position: absolute;
          right: -0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
        }

        .footer-tagline {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          letter-spacing: 0.3px;
        }

        /* Links Section */
        .footer-links-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .link-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .link-category {
          font-size: 0.7rem;
          font-weight: 600;
          color: #a78bfa;
          letter-spacing: 1.5px;
          min-width: 85px;
        }

        .link-items {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .link-items a,
        .link-items Link {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .link-items a:hover,
        .link-items Link:hover {
          color: #a78bfa;
          transform: translateX(2px);
        }

        /* Bottom Section */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-social {
          display: flex;
          gap: 1.25rem;
        }

        .footer-social a {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .footer-social a:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          transform: translateY(-3px);
        }

        .footer-copyright p {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
        }

        .back-to-top {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          padding: 0.4rem 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-to-top:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.4);
          color: #a78bfa;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }

          .footer-name {
            gap: 1rem;
            font-size: 0.9rem;
          }

          .footer-name span:not(:last-child)::after {
            right: -0.5rem;
            height: 10px;
          }

          .link-row {
            flex-direction: column;
            gap: 0.5rem;
          }

          .link-category {
            min-width: auto;
          }

          .link-items {
            gap: 1rem;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .footer {
            padding: 2rem 0 1.5rem;
          }

          .link-items {
            gap: 0.8rem;
          }

          .link-items a,
          .link-items Link {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;