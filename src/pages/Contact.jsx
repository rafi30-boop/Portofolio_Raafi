// src/pages/Contact.jsx
import React, { useState } from "react";
import { messagesAPI } from "../services/api.js";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaSpinner, FaPaperPlane, FaCheckCircle, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("📤 Sending message:", formData);

    try {
      // Kirim data ke Supabase via API
      const result = await messagesAPI.create(formData);
      console.log("✅ Response from server:", result);
      
      toast.success("Message sent successfully!");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("❌ Error details:", error);
      console.error("❌ Error message:", error.message);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      label: "Email",
      value: "john.doe@example.com",
      link: "mailto:john.doe@example.com"
    },
    {
      icon: <FaPhone />,
      label: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: <FaMapMarkerAlt />,
      label: "Location",
      value: "San Francisco, CA",
      link: null
    },
    {
      icon: <FaClock />,
      label: "Availability",
      value: "Mon-Fri",
      link: null
    }
  ];

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <span className="section-badge">Get In Touch</span>
          <h1 className="contact-title">
            Let's Work <span className="gradient-text">Together</span>
          </h1>
          <p className="contact-subtitle">
            Have a question or want to work together? Feel free to contact me!
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-card glass">
            <h2>Let's Talk</h2>
            <p className="contact-info-desc">
              Feel free to reach out for collaborations, project inquiries, or just a friendly chat.
            </p>
            
            <div className="contact-info-items">
              {contactInfo.map((info, index) => (
                <div key={index} className="contact-info-item">
                  <div className="contact-icon">{info.icon}</div>
                  <div className="contact-info-detail">
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
                <a href="https://github.com/johndoe" target="_blank" rel="noopener noreferrer" className="social-link">GitHub</a>
                <a href="https://linkedin.com/in/johndoe" target="_blank" rel="noopener noreferrer" className="social-link">LinkedIn</a>
                <a href="https://twitter.com/johndoe" target="_blank" rel="noopener noreferrer" className="social-link">Twitter</a>
                <a href="mailto:john.doe@example.com" className="social-link">Email</a>
              </div>
            </div>
          </div>

          <div className="contact-form-card glass">
            <h2>Send Me a Message</h2>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Project Inquiry"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project..."
                  rows="5"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="btn-icon" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .contact-page {
          min-height: 100vh;
          padding: 100px 0 60px;
          background: var(--bg-primary, #07070e);
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .contact-header {
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

        .contact-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 16px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #818cf8, #38bdf8, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .contact-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
        }

        .contact-info-card {
          padding: 32px;
        }

        .contact-info-card h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: white;
        }

        .contact-info-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .contact-info-items {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 32px;
        }

        .contact-info-item {
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

        .contact-info-detail {
          flex: 1;
        }

        .contact-info-detail span {
          display: block;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .contact-info-detail p,
        .contact-info-detail a {
          font-size: 0.9rem;
          color: white;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .contact-info-detail a:hover {
          color: #a78bfa;
        }

        .contact-social {
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .contact-social h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: white;
        }

        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .social-link {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: rgba(167, 139, 250, 0.3);
          color: #a78bfa;
          transform: translateY(-2px);
        }

        .contact-form-card {
          padding: 32px;
        }

        .contact-form-card h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 24px;
          color: white;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
        }

        .form-group .required {
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

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
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

        .btn--primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn--full {
          width: 100%;
        }

        .btn-icon {
          font-size: 0.9rem;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 968px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }

          .contact-info-card,
          .contact-form-card {
            padding: 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;