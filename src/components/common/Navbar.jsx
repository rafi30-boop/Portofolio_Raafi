// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  const navItems = [
    { path: "/", label: "Home", section: "home", isHash: true },
    { path: "/about", label: "About", section: "about", isHash: true },
    { path: "/certificates", label: "Certificates", isHash: false },
    { path: "/projects", label: "Projects", isHash: false },
    { path: "/cv", label: "CV", isHash: false },
    { path: "/contact", label: "Contact", section: "contact", isHash: true },
  ];

  // Handle scroll effect and section detection
  useEffect(() => {
    const handleScroll = () => {
      // Scroll effect
      setIsScrolled(window.scrollY > 50);

      // Section detection only on homepage
      if (isHomePage) {
        const sections = ["home", "about", "contact"];
        const scrollPosition = window.scrollY + 100;

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (
              scrollPosition >= offsetTop &&
              scrollPosition < offsetTop + offsetHeight
            ) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const scrollToSection = (sectionId) => {
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      }
    } else {
      // If not on homepage, navigate to homepage and then scroll
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleNavClick = (item) => {
    // Close mobile menu first
    setIsOpen(false);

    // Handle hash links (Home, About, Contact)
    if (item.isHash && item.section) {
      if (isHomePage) {
        // If already on homepage, just scroll to section
        scrollToSection(item.section);
      } else {
        // If not on homepage, navigate first then scroll
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(item.section);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
    // Handle regular links
    else {
      navigate(item.path);
    }
  };

  const getLinkClass = (item) => {
    let isActive = false;

    // For hash sections on homepage
    if (item.section && isHomePage && activeSection === item.section) {
      isActive = true;
    }
    // For regular routes
    else if (location.pathname === item.path && !item.section) {
      isActive = true;
    }
    // For home route
    else if (item.path === "/" && location.pathname === "/" && !item.section) {
      isActive = true;
    }

    return `navbar-link ${isActive ? "navbar-link--active" : ""}`;
  };

  return (
    <nav className={`navbar ${isScrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link
            to="/"
            className="gradient-text"
            style={{ textDecoration: "none" }}
          >
            Portfolio
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={getLinkClass(item)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
            >
              {item.label}
            </button>
          ))}

          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <div className="navbar-mobile-button">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="navbar-mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className="navbar-mobile-link"
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
