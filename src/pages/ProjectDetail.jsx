// src/pages/ProjectDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { projectsAPI } from "../services/api.js";
import { FaGithub, FaExternalLinkAlt, FaArrowLeft, FaCode, FaTrophy, FaCalendarAlt, FaUserTie } from "react-icons/fa";
import Button from "../styles/components/ui/Button.jsx";
import toast from "react-hot-toast";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getById(id);
      setProject(data);
    } catch (error) {
      console.error("Error loading item:", error);
      toast.error("Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="project-detail-loading">
        <div className="spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-notfound">
        <h2>Project not found</h2>
        <Link to="/projects">
          <Button>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="container">
        <Link to="/projects" className="back-link">
          <FaArrowLeft /> Back to Portfolio
        </Link>

        <div className="project-detail-content glass">
          <div className="project-detail-image">
            <img
              src={project.image_file || "https://dummyimage.com/600x400/1a1a2e/ffffff&text=No+Image"}
              alt={project.title}
              onError={(e) => {
                e.target.src = "https://dummyimage.com/600x400/1a1a2e/ffffff&text=No+Image";
              }}
            />
            <div className={`project-type-badge ${project.type}`}>
              {project.type === "project" ? <FaCode /> : <FaTrophy />}
              {project.type === "project" ? "Project" : "Achievement"}
            </div>
          </div>

          <div className="project-detail-info">
            <h1 className="project-detail-title gradient-text">
              {project.title}
            </h1>

            {project.type === "achievement" && (
              <div className="project-detail-achievement-meta">
                <div className="meta-item">
                  <FaCalendarAlt />
                  <div>
                    <span>Date</span>
                    <p>{project.date || "Not specified"}</p>
                  </div>
                </div>
                {project.issuer && (
                  <div className="meta-item">
                    <FaUserTie />
                    <div>
                      <span>Issuer</span>
                      <p>{project.issuer}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {project.description && (
              <div className="project-detail-description">
                <h3>Description</h3>
                <p>{project.description}</p>
              </div>
            )}

            {project.technologies?.length > 0 && (
              <div className="project-detail-technologies">
                <h3>Technologies Used</h3>
                <div className="tech-list">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.type === "project" && (
              <div className="project-detail-actions">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                  >
                    <FaExternalLinkAlt /> Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--secondary"
                  >
                    <FaGithub /> GitHub Repository
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .project-detail-page {
          min-height: 100vh;
          padding: 100px 0 60px;
          background: var(--bg-primary, #07070e);
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #a78bfa;
          text-decoration: none;
          margin-bottom: 24px;
          transition: gap 0.3s ease;
        }

        .back-link:hover {
          gap: 12px;
        }

        .project-detail-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .project-detail-image {
          position: relative;
          overflow: hidden;
          min-height: 300px;
        }

        .project-detail-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .project-detail-image img:hover {
          transform: scale(1.02);
        }

        .project-type-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .project-type-badge.project {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
        }

        .project-type-badge.achievement {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .project-detail-info {
          padding: 32px;
        }

        .project-detail-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #818cf8, #38bdf8, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .project-detail-achievement-meta {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .project-detail-description {
          margin-bottom: 24px;
        }

        .project-detail-description h3,
        .project-detail-technologies h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .project-detail-description p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
        }

        .project-detail-technologies {
          margin-bottom: 24px;
        }

        .tech-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tech-tag {
          padding: 6px 14px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          font-size: 0.8rem;
          color: #a78bfa;
          transition: all 0.3s ease;
        }

        .tech-tag:hover {
          background: rgba(139, 92, 246, 0.25);
          transform: translateY(-2px);
        }

        .project-detail-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 0.9rem;
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

        .meta-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .meta-item svg {
          font-size: 1.1rem;
          color: #a78bfa;
        }

        .meta-item div span {
          display: block;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }

        .meta-item div p {
          font-size: 0.9rem;
          color: white;
          font-weight: 500;
        }

        .project-detail-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .project-detail-notfound {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          text-align: center;
        }

        .project-detail-notfound h2 {
          color: white;
        }

        @media (max-width: 768px) {
          .project-detail-content {
            grid-template-columns: 1fr;
          }
          
          .project-detail-info {
            padding: 24px;
          }
          
          .project-detail-title {
            font-size: 1.4rem;
          }
          
          .project-detail-actions {
            flex-direction: column;
          }
          
          .project-detail-actions .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetail;