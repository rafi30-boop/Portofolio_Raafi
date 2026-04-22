// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { messagesAPI } from "../services/api.js";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaTwitter,
  FaInstagram,
  FaCode,
  FaMobileAlt,
  FaServer,
  FaPalette,
  FaCheckCircle,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaPaperPlane,
  FaCoffee,
  FaMusic,
  FaGamepad,
  FaBook,
  FaDumbbell,
  FaMoon,
  FaSpinner,
  FaLaptopCode,
  FaDatabase,
  FaPaintBrush,
  FaRocket,
} from "react-icons/fa";
import toast from "react-hot-toast";

// ============================================
// DATA PRIBADI - RAAFI MUHAMAD FAJAR
// ============================================

const SOCIAL_LINKS = [
  {
    id: "github",
    icon: FaGithub,
    url: "https://github.com/rafi30-boop",
    label: "GitHub",
  },
  {
    id: "linkedin",
    icon: FaLinkedin,
    url: "https://www.linkedin.com/in/raafi-fajar-66b9793a5/",
    label: "LinkedIn",
  },
  {
    id: "instagram",
    icon: FaInstagram,
    url: "https://www.instagram.com/raftssst/",
    label: "Instagram",
  },
];

// SKILLS dengan level sesuai kemampuan (realistis untuk siswa SMK)
const SKILLS = [
  { name: "HTML/CSS", level: 85, category: "frontend", icon: "🌐" },
  { name: "JavaScript", level: 70, category: "frontend", icon: "📜" },
  { name: "React.js", level: 65, category: "frontend", icon: "⚛️" },
  { name: "Tailwind CSS", level: 75, category: "frontend", icon: "🎨" },
  { name: "Node.js", level: 50, category: "backend", icon: "🟢" },
  { name: "PHP", level: 50, category: "backend", icon: "🐘" },
  { name: "MySQL", level: 55, category: "backend", icon: "🗄️" },
  { name: "Git/GitHub", level: 50, category: "devops", icon: "📦" },
  { name: "Figma", level: 70, category: "design", icon: "🎨" },
];

// SERVICES yang ditawarkan
const SERVICES = [
  {
    icon: <FaLaptopCode />,
    title: "Web Development",
    description:
      "Membangun website modern, responsif, dan user-friendly dengan teknologi terkini.",
  },
  {
    icon: <FaMobileAlt />,
    title: "Mobile-First Design",
    description:
      "Mendesain tampilan yang optimal di semua device, dari mobile hingga desktop.",
  },
  {
    icon: <FaDatabase />,
    title: "Backend Integration",
    description:
      "Mengintegrasikan database dan membuat API untuk website yang dinamis.",
  },
  {
    icon: <FaPaintBrush />,
    title: "UI/UX Design",
    description:
      "Mendesain antarmuka yang menarik, intuitif, dan mudah digunakan.",
  },
];

// TIMELINE perjalanan Raafi
const TIMELINE = [
  {
    year: "2022",
    title: "Masuk SMKN 1 Ciomas",
    description:
      "Memulai perjalanan di jurusan Pengembangan Perangkat Lunak Dan Game (PPLG).",
    icon: "🎓",
  },
  {
    year: "2023",
    title: "Belajar Web Development",
    description: "Menguasai HTML, CSS, JavaScript, dan mulai belajar React.js.",
    icon: "💻",
  },
  {
    year: "2024",
    title: "Membuat Project Pertama",
    description:
      "Menyelesaikan website portofolio dan aplikasi CRUD sederhana.",
    icon: "🚀",
  },
  {
    year: "2025",
    title: "Mencari PKL / Magang",
    description: "Siap mengaplikasikan skill di dunia kerja dan terus belajar.",
    icon: "🎯",
  },
];

// PENCAPAIAN / STATISTIK
const ACHIEVEMENTS = [
  { icon: "📁", value: "8+", label: "Projects Completed" },
  { icon: "😊", value: "5+", label: "Happy Clients" },
  { icon: "📜", value: "3", label: "Certifications" },
  { icon: "🎯", value: "100%", label: "Commitment" },
];

// FUN FACTS tentang Raafi
const FUN_FACTS = [
  {
    icon: <FaCoffee />,
    fact: "Coffee Lover",
    detail: "Ngoding sambil ngopi biar makin semangat",
  },
  {
    icon: <FaMusic />,
    fact: "Music Enthusiast",
    detail: "Coding with lo-fi beats",
  },
  { icon: <FaMoon />, fact: "Night Owl", detail: "Produktif saat malam hari" },
  { icon: <FaGamepad />, fact: "Gamer", detail: "Main game buat refreshing" },
  {
    icon: <FaBook />,
    fact: "Avid Learner",
    detail: "Always curious about new tech",
  },
  {
    icon: <FaDumbbell />,
    fact: "Fitness",
    detail: "Jaga kesehatan biar tetap produktif",
  },
];

// INTERESTS / MINAT
const INTERESTS = [
  { name: "Open Source", icon: "🐙" },
  { name: "Web3", icon: "⛓️" },
  { name: "AI Tools", icon: "🤖" },
  { name: "UI/UX", icon: "🎨" },
  { name: "Photography", icon: "📷" },
  { name: "Tech Content", icon: "📹" },
];

// CONTACT INFO - Data Raafi
const CONTACT_INFO = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "raafifajar892@gmail.com",
    link: "mailto:raafifajar892@gmail.com",
  },
  {
    icon: <FaPhone />,
    label: "Phone",
    value: "+62 812-1166-4531",
    link: "tel:+6281211664531",
  },
  {
    icon: <FaMapMarkerAlt />,
    label: "Location",
    value: "Bogor, Indonesia",
    link: null,
  },
  {
    icon: <FaClock />,
    label: "Availability",
    value: "Senin - Jumat",
    link: null,
  },
];

// ============================================
// COMPONENTS
// ============================================

const SkillBar = ({ skill, index }) => {
  const [width, setWidth] = useState(0);
  const skillRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setWidth(skill.level);
        }
      },
      { threshold: 0.1 },
    );

    if (skillRef.current) {
      observer.observe(skillRef.current);
    }

    return () => observer.disconnect();
  }, [skill.level]);

  return (
    <div className="skill-item" ref={skillRef}>
      <div className="skill-info">
        <span className="skill-icon">{skill.icon}</span>
        <span className="skill-name">{skill.name}</span>
        <span className="skill-level">{skill.level}%</span>
      </div>
      <div className="skill-bar">
        <div className="skill-progress" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
};

const ServiceCard = ({ service }) => {
  return (
    <div className="service-card glass">
      <div className="service-icon">{service.icon}</div>
      <h4>{service.title}</h4>
      <p>{service.description}</p>
    </div>
  );
};

const TimelineItem = ({ item, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`timeline-item ${isVisible ? "timeline-item--visible" : ""}`}
      ref={itemRef}
    >
      <div className="timeline-marker">
        <div className="timeline-icon">{item.icon}</div>
        <div className="timeline-line" />
      </div>
      <div className="timeline-content">
        <span className="timeline-year">{item.year}</span>
        <h4>{item.title}</h4>
        <p>{item.description}</p>
      </div>
    </div>
  );
};

// ============================================
// SECTIONS
// ============================================

const HeroSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-background" aria-hidden="true" />
      <div className="hero-orb hero-orb--1" aria-hidden="true" />
      <div className="hero-orb hero-orb--2" aria-hidden="true" />
      <div className="hero-orb hero-orb--3" aria-hidden="true" />
      <div className="hero-orb hero-orb--4" aria-hidden="true" />

      <div className="hero-container">
        <div className="hero-badge">
          <span className="hero-badge__dot" />
          <span>STATUS: MENCARI PKL / MAGANG</span>
        </div>

        <h1 className="hero-title">
          <span className="gradient-text">RAAFI MUHAMAD FAJAR</span>
        </h1>

        <p className="hero-subtitle">Web Developer | Siswa SMKN 1 Ciomas</p>

        <p className="hero-description">
          Saya seorang developer yang fokus membuat website modern, responsive,
          dan user-friendly menggunakan teknologi terbaru. Siap membawa ide Anda
          menjadi realita.
        </p>

        <div className="hero-buttons">
          <button
            onClick={scrollToContact}
            className="btn btn--primary"
            style={{ cursor: "pointer" }}
          >
            Hubungi Saya
            <FaArrowRight className="btn-icon" />
          </button>
          <a href="#about" className="btn btn--secondary">
            Tentang Saya
          </a>
        </div>

        <div className="hero-social">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.id}
              href={social.url}
              className={`social-link social-link--${social.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
            >
              <social.icon />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => {
  const [activeTab, setActiveTab] = useState("skills");
  const sectionRef = useRef(null);

  const tabs = [
    { id: "skills", label: "Skills & Expertise" },
    { id: "journey", label: "My Journey" },
    { id: "interests", label: "Interests & Fun Facts" },
  ];

  const skillsByCategory = SKILLS.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categoryLabels = {
    frontend: "Frontend Development",
    backend: "Backend Development",
    devops: "DevOps & Tools",
    design: "Design",
  };

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="container">
        <div className="section-header">
          <span className="section-badge">About Me</span>
          <h2 className="section-title">
            Get to Know
            <span className="gradient-text"> Me Better</span>
          </h2>
          <p className="section-subtitle">
            Seorang siswa SMK yang passionate dalam dunia web development
          </p>
        </div>

        <div className="about-grid">
          {/* Left Column - Bio Card */}
          <div className="about-bio-card glass">
            <div className="bio-header">
              <div className="bio-avatar">
                <img
                  src="https://ui-avatars.com/api/?background=7c3aed&color=fff&name=Raafi+Muhamad+Fajar&size=120&rounded=true&bold=true"
                  alt="Raafi Muhamad Fajar"
                />
                <div className="bio-status">
                  <span className="status-dot"></span>
                  Open for Opportunities
                </div>
              </div>
              <div className="bio-info">
                <h3>RAAFI MUHAMAD FAJAR</h3>
                <p>WEB DEVELOPER</p>
                <div className="bio-location">
                  <FaMapMarkerAlt />
                  <span>Bogor, Indonesia</span>
                </div>
              </div>
            </div>

            <div className="bio-text">
              <p>
                Halo! Saya Raafi, seorang siswa SMKN 1 Ciomas jurusan Pengembangan
                Perangkat Lunak Dan Game (PPLG). Ketertarikan saya di dunia coding dimulai
                sejak kelas 10, ketika pertama kali belajar membuat website
                sederhana dengan HTML dan CSS. Sejak saat itu, saya terus
                belajar dan mengasah skill agar bisa menciptakan website yang
                tidak hanya berfungsi dengan baik, tetapi juga nyaman digunakan.
              </p>
              <p>
                Saya percaya bahwa teknologi terbaik adalah yang bisa
                menyelesaikan masalah nyata. Dalam bekerja, saya selalu berusaha
                menulis kode yang bersih, terstruktur, dan mudah dipelihara.
                Saya juga senang belajar hal baru dan berkolaborasi dengan tim.
                Saat ini saya sedang mencari kesempatan PKL (Praktek Kerja
                Lapangan) atau magang untuk mengaplikasikan ilmu yang saya
                pelajari dan terus berkembang bersama profesional di industri.
              </p>
            </div>

            <div className="bio-achievements">
              {ACHIEVEMENTS.map((item, index) => (
                <div key={index} className="bio-achievement">
                  <span className="achievement-icon">{item.icon}</span>
                  <div className="achievement-info">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="about-tabs-container">
            <div className="tabs-header">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? "tab-btn--active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tabs-content">
              {/* Skills Tab */}
              {activeTab === "skills" && (
                <div className="skills-tab">
                  {Object.entries(skillsByCategory).map(
                    ([category, skills]) => (
                      <div key={category} className="skill-category">
                        <h4 className="category-title">
                          {categoryLabels[category] || category}
                        </h4>
                        <div className="skills-list">
                          {skills.map((skill, index) => (
                            <SkillBar
                              key={skill.name}
                              skill={skill}
                              index={index}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

              {/* Journey Tab */}
              {activeTab === "journey" && (
                <div className="journey-tab">
                  <div className="timeline">
                    {TIMELINE.map((item, index) => (
                      <TimelineItem key={index} item={item} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* Interests Tab */}
              {activeTab === "interests" && (
                <div className="interests-tab">
                  <div className="fun-facts-grid">
                    {FUN_FACTS.map((fact, index) => (
                      <div key={index} className="fun-fact-card">
                        <div className="fun-fact-icon">{fact.icon}</div>
                        <div className="fun-fact-info">
                          <h4>{fact.fact}</h4>
                          <p>{fact.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="interests-grid">
                    <h4 className="interests-title">
                      Things I'm Passionate About
                    </h4>
                    <div className="interests-list">
                      {INTERESTS.map((interest, index) => (
                        <span key={index} className="interest-tag">
                          {interest.icon} {interest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="services-section">
          <h3 className="services-title">What I Do</h3>
          <div className="services-grid">
            {SERVICES.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Panggil API untuk menyimpan pesan ke Supabase
      const result = await messagesAPI.create(formData);
      console.log("Message sent:", result);

      setSubmitStatus("success");
      toast.success("Pesan berhasil dikirim! Saya akan membalas segera.");
      setFormData({ name: "", email: "", subject: "", message: "" });

      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitStatus("error");
      toast.error("Gagal mengirim pesan. Silakan coba lagi.");

      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Get In Touch</span>
          <h2 className="section-title">
            Let's Work
            <span className="gradient-text"> Together</span>
          </h2>
          <p className="section-subtitle">
            Saya terbuka untuk kerja sama, project, atau sekadar diskusi. Jangan
            ragu untuk menghubungi saya!
          </p>
        </div>

        <div className="contact-grid">
          {/* Left Column - Contact Info */}
          <div className="contact-info">
            <div className="contact-info-card glass">
              <h3>Let's Talk</h3>
              <p>
                Punya proyek menarik? Atau sedang mencari anak magang untuk tim
                developer? Saya siap berkolaborasi dan memberikan yang terbaik.
              </p>

              <div className="contact-details">
                {CONTACT_INFO.map((info, index) => (
                  <div key={index} className="contact-detail">
                    <div className="contact-icon">{info.icon}</div>
                    <div className="contact-text">
                      <span>{info.label}</span>
                      {info.link ? (
                        <a href={info.link}>{info.value}</a>
                      ) : (
                        <p>{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-social">
                <h4>Connect With Me</h4>
                <div className="social-links">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      className="contact-social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <social.icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form glass">
              <h3>Kirim Pesan</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Nama Lengkap <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nama Anda"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subjek</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="PKL / Magang / Kerjasama"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  Pesan <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Tulis pesan Anda di sini..."
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Pesan <FaPaperPlane className="btn-icon" />
                  </>
                )}
              </button>

              {submitStatus === "success" && (
                <div className="form-success">
                  <FaCheckCircle /> Pesan berhasil dikirim! Saya akan membalas
                  segera.
                </div>
              )}

              {submitStatus === "error" && (
                <div className="form-error">
                  Gagal mengirim pesan. Silakan coba lagi nanti.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// MAIN LANDING PAGE
// ============================================

const LandingPage = () => {
  return (
    <div className="landing-page">
      <HeroSection />
      <AboutSection />
      <ContactSection />

      <style>{`
        /* ============================================ */
        /* Global Styles */
        /* ============================================ */
        .landing-page {
          min-height: 100vh;
          background: #07070e;
          color: rgba(255, 255, 255, 0.8);
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ============================================ */
        /* Hero Section */
        /* ============================================ */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 120px 24px 80px;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15), transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.1), transparent 50%);
          pointer-events: none;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          pointer-events: none;
        }

        .hero-orb--1 {
          width: 300px;
          height: 300px;
          background: #7c3aed;
          top: 10%;
          left: -100px;
        }

        .hero-orb--2 {
          width: 400px;
          height: 400px;
          background: #0ea5e9;
          bottom: 10%;
          right: -100px;
        }

        .hero-orb--3 {
          width: 200px;
          height: 200px;
          background: #10b981;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .hero-orb--4 {
          width: 150px;
          height: 150px;
          background: #f59e0b;
          bottom: 20%;
          left: 20%;
        }

        .hero-container {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #a78bfa;
          margin-bottom: 24px;
        }

        .hero-badge__dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .hero-title {
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 800;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #818cf8, #38bdf8, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
        }

        .hero-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }

        .btn--primary {
          background: linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9);
          color: white;
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 57, 242, 0.4);
        }

        .btn--secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn--secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .btn--full {
          width: 100%;
          justify-content: center;
        }

        .btn-icon {
          font-size: 0.9rem;
          transition: transform 0.3s ease;
        }

        .btn:hover .btn-icon {
          transform: translateX(4px);
        }

        .hero-social {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .social-link {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          transform: translateY(-3px);
        }

        /* ============================================ */
        /* About Section */
        /* ============================================ */
        .about-section {
          padding: 80px 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .section-badge {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #a78bfa;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          max-width: 600px;
          margin: 0 auto;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 64px;
        }

        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
        }

        .about-bio-card {
          padding: 32px;
        }

        .bio-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .bio-avatar {
          position: relative;
        }

        .bio-avatar img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(139, 92, 246, 0.5);
        }

        .bio-status {
          position: absolute;
          bottom: 0;
          right: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.8);
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.65rem;
          white-space: nowrap;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }

        .bio-info h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .bio-info p {
          color: #a78bfa;
          margin-bottom: 8px;
          font-size: 0.85rem;
        }

        .bio-location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .bio-text {
          margin-bottom: 24px;
        }

        .bio-text p {
          font-size: 0.9rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
        }

        .bio-achievements {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .bio-achievement {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .achievement-icon {
          font-size: 1.8rem;
        }

        .achievement-info {
          display: flex;
          flex-direction: column;
        }

        .achievement-info strong {
          font-size: 1.1rem;
          color: white;
        }

        .achievement-info span {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .about-tabs-container {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .tabs-header {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .tab-btn {
          flex: 1;
          padding: 16px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .tab-btn--active {
          color: #a78bfa;
          border-bottom: 2px solid #a78bfa;
        }

        .tabs-content {
          padding: 24px;
        }

        /* Skills Tab */
        .skill-category {
          margin-bottom: 28px;
        }

        .category-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: white;
        }

        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .skill-item {
          width: 100%;
        }

        .skill-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .skill-icon {
          font-size: 1.1rem;
        }

        .skill-name {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .skill-level {
          font-size: 0.75rem;
          color: #a78bfa;
        }

        .skill-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .skill-progress {
          height: 100%;
          background: linear-gradient(90deg, #a78bfa, #38bdf8);
          border-radius: 3px;
          transition: width 1s ease-out;
        }

        /* Journey Tab */
        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline-item {
          position: relative;
          padding-bottom: 32px;
          opacity: 0;
          transform: translateX(-20px);
          transition: all 0.5s ease;
        }

        .timeline-item--visible {
          opacity: 1;
          transform: translateX(0);
        }

        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 0;
        }

        .timeline-icon {
          width: 40px;
          height: 40px;
          background: rgba(139, 92, 246, 0.15);
          border: 2px solid rgba(139, 92, 246, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .timeline-line {
          position: absolute;
          top: 40px;
          left: 19px;
          width: 2px;
          height: calc(100% - 40px);
          background: rgba(139, 92, 246, 0.3);
        }

        .timeline-item:last-child .timeline-line {
          display: none;
        }

        .timeline-content {
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          border-radius: 12px;
        }

        .timeline-year {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 4px;
          font-size: 0.7rem;
          color: #a78bfa;
          margin-bottom: 8px;
        }

        .timeline-content h4 {
          font-size: 1rem;
          margin-bottom: 6px;
          color: white;
        }

        .timeline-content p {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Interests Tab */
        .fun-facts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .fun-fact-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .fun-fact-icon {
          font-size: 1.5rem;
        }

        .fun-fact-info h4 {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: white;
        }

        .fun-fact-info p {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .interests-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: white;
        }

        .interests-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .interest-tag {
          padding: 6px 14px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          font-size: 0.8rem;
          color: #a78bfa;
        }

        /* Services Section */
        .services-section {
          margin-top: 64px;
        }

        .services-title {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 32px;
          color: white;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .service-card {
          padding: 24px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-5px);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .service-icon {
          font-size: 2rem;
          color: #a78bfa;
          margin-bottom: 16px;
        }

        .service-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: white;
        }

        .service-card p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }

        /* ============================================ */
        /* Contact Section */
        /* ============================================ */
        .contact-section {
          padding: 80px 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .contact-info-card {
          padding: 32px;
        }

        .contact-info-card h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: white;
        }

        .contact-info-card > p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 32px;
        }

        .contact-detail {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .contact-icon {
          width: 44px;
          height: 44px;
          background: rgba(167, 139, 250, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #a78bfa;
        }

        .contact-text {
          flex: 1;
        }

        .contact-text span {
          display: block;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .contact-text p,
        .contact-text a {
          font-size: 0.9rem;
          color: white;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .contact-text a:hover {
          color: #a78bfa;
        }

        .contact-social h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: white;
        }

        .contact-social .social-links {
          display: flex;
          gap: 12px;
        }

        .contact-social-link {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }

        .contact-social-link:hover {
          background: rgba(139, 92, 246, 0.2);
          color: #a78bfa;
          transform: translateY(-3px);
        }

        .contact-form-container {
          padding: 32px;
        }

        .contact-form h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 24px;
          color: white;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
        }

        .required {
          color: #ef4444;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #a78bfa;
          box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-success {
          margin-top: 16px;
          padding: 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 10px;
          color: #10b981;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-error {
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #ef4444;
          font-size: 0.85rem;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ============================================ */
        /* Responsive */
        /* ============================================ */
        @media (max-width: 968px) {
          .about-grid,
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .hero-buttons .btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }

          .bio-header {
            flex-direction: column;
            text-align: center;
          }

          .bio-achievements {
            grid-template-columns: 1fr;
          }

          .tabs-header {
            flex-direction: column;
          }

          .tab-btn {
            padding: 12px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .contact-info-card,
          .contact-form-container {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
