// src/pages/Projects.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { projectsAPI } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import Card from "../styles/components/ui/Card.jsx";
import Button from "../styles/components/ui/Button.jsx";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCode,
  FaTrophy,
  FaTimes,
  FaSpinner,
  FaUpload,
  FaSearch,
  FaCalendarAlt,
  FaUserTie,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    demo_url: "",
    github_url: "",
    technologies: [],
    type: "project",
    date: "",
    issuer: "",
  });
  const [techInput, setTechInput] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, projects, filter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (filter !== "all") {
      filtered = filtered.filter(p => p.type === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
    setCurrentPage(1);
  };

  const handleAddTech = () => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput("");
    }
  };

  const handleRemoveTech = (index) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((_, i) => i !== index),
    });
  };

  const uploadImage = async (file) => {
    try {
      const publicUrl = await projectsAPI.uploadImage(file);
      return publicUrl;
    } catch (error) {
      throw new Error(error.message || "Failed to upload image");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImageFile(null);
    setPreview(null);
    setFormData({ ...formData, image_url: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.type === "achievement" && !formData.date) {
      toast.error("Please enter the achievement date");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image_url;

      if (imageFile) {
        toast.loading("Uploading image...", { id: "upload" });
        imageUrl = await uploadImage(imageFile);
        toast.success("Image uploaded successfully!", { id: "upload" });
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        image_url: imageUrl || "",
        demo_url: formData.demo_url || "",
        github_url: formData.github_url || "",
        technologies: formData.technologies,
        type: formData.type,
        date: formData.date || "",
        issuer: formData.issuer || "",
      };

      if (editingProject) {
        await projectsAPI.update(editingProject.id, payload);
        toast.success(`${formData.type === "project" ? "Project" : "Achievement"} updated successfully`);
      } else {
        await projectsAPI.create({ ...payload, user_id: user?.id });
        toast.success(`${formData.type === "project" ? "Project" : "Achievement"} added successfully`);
      }

      closeModal();
      await loadProjects();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await projectsAPI.delete(id);
        toast.success("Deleted successfully");
        await loadProjects();
      } catch (error) {
        console.error("Error deleting:", error);
        toast.error("Failed to delete");
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      image_url: project.image_url || "",
      demo_url: project.demo_url || "",
      github_url: project.github_url || "",
      technologies: project.technologies || [],
      type: project.type || "project",
      date: project.date || "",
      issuer: project.issuer || "",
    });
    setPreview(project.image_url || null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      demo_url: "",
      github_url: "",
      technologies: [],
      type: "project",
      date: "",
      issuer: "",
    });
    setImageFile(null);
    setPreview(null);
    setTechInput("");
  };

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const projectCount = projects.filter(p => p.type === "project").length;
  const achievementCount = projects.filter(p => p.type === "achievement").length;

  // Skeleton Loading
  if (loading) {
    return (
      <div className="projects-page">
        <div className="container">
          <div className="projects-header">
            <h1 className="projects-title gradient-text">My Portfolio</h1>
            <p className="projects-subtitle">Loading projects...</p>
          </div>
          <div className="projects-grid skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 28px;
          }
          .skeleton-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 20px;
            overflow: hidden;
            animation: pulse 1.5s ease-in-out infinite;
          }
          .skeleton-image {
            height: 220px;
            background: rgba(255, 255, 255, 0.05);
          }
          .skeleton-title {
            height: 24px;
            margin: 20px 20px 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }
          .skeleton-text {
            height: 60px;
            margin: 0 20px 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="container">
        <div className="projects-header">
          <h1 className="projects-title gradient-text">My Portfolio</h1>
          <p className="projects-subtitle">Projects & Achievements</p>
        </div>

        <div className="projects-toolbar">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              onClick={() => setFilter("all")}
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilter("project")}
              className={`filter-btn ${filter === "project" ? "active" : ""}`}
            >
              <FaCode /> Projects ({projectCount})
            </button>
            <button
              onClick={() => setFilter("achievement")}
              className={`filter-btn ${filter === "achievement" ? "active" : ""}`}
            >
              <FaTrophy /> Achievements ({achievementCount})
            </button>
          </div>

          {user && (
            <Button onClick={() => setIsModalOpen(true)}>
              <FaPlus /> Add New
            </Button>
          )}
        </div>

        {paginatedProjects.length === 0 ? (
          <div className="projects-empty">
            <FaCode className="empty-icon" />
            <h3>No Items Found</h3>
            <p>
              {searchTerm
                ? "No items match your search criteria"
                : "Start adding your projects and achievements"}
            </p>
            {user && !searchTerm && (
              <Button onClick={() => setIsModalOpen(true)}>
                <FaPlus /> Add Your First Item
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="projects-grid">
              {paginatedProjects.map((item) => (
                <div key={item.id} className="project-card">
                  {/* Image section with Link only for the image */}
                  <div className="project-image-wrapper">
                    <Link to={`/projects/${item.id}`} className="project-image-link">
                      <img
                        src={item.image_file || "https://dummyimage.com/400x300/1a1a2e/ffffff&text=No+Image"}
                        alt={item.title}
                        className="project-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "https://dummyimage.com/400x300/1a1a2e/ffffff&text=No+Image";
                        }}
                      />
                      <div className="project-overlay">
                        <span className="view-details">View Details</span>
                      </div>
                    </Link>
                    <div className={`project-type-badge ${item.type}`}>
                      {item.type === "project" ? <FaCode size={12} /> : <FaTrophy size={12} />}
                      {item.type === "project" ? "Project" : "Achievement"}
                    </div>
                    {user && (
                      <div className="project-actions">
                        <button onClick={() => handleEdit(item)} className="action-btn edit" title="Edit">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="action-btn delete" title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content section - Title as Link */}
                  <div className="project-content">
                    <Link to={`/projects/${item.id}`} className="project-title-link">
                      <h3>{item.title}</h3>
                    </Link>
                    <p>{item.description?.substring(0, 100)}...</p>
                    
                    {item.type === "achievement" && (
                      <div className="achievement-meta">
                        {item.date && (
                          <div className="meta-item">
                            <FaCalendarAlt />
                            <span>{item.date}</span>
                          </div>
                        )}
                        {item.issuer && (
                          <div className="meta-item">
                            <FaUserTie />
                            <span>{item.issuer}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.technologies?.length > 0 && (
                      <div className="project-tech">
                        {item.technologies.slice(0, 3).map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                        {item.technologies.length > 3 && (
                          <span className="tech-tag">+{item.technologies.length - 3}</span>
                        )}
                      </div>
                    )}

                    {item.type === "project" && (
                      <div className="project-links">
                        {item.demo_url && (
                          <button
                            onClick={() => window.open(item.demo_url, '_blank')}
                            className="link-button"
                            title="Live Demo"
                          >
                            <FaExternalLinkAlt />
                          </button>
                        )}
                        {item.github_url && (
                          <button
                            onClick={() => window.open(item.github_url, '_blank')}
                            className="link-button"
                            title="GitHub"
                          >
                            <FaGithub />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="projects-pagination">
                <Button variant="secondary" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button variant="secondary" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal - same as before */}
      {isModalOpen && (
        <div className="projects-modal-overlay" onClick={() => !uploading && closeModal()}>
          <div className="projects-modal" onClick={(e) => e.stopPropagation()}>
            <div className="projects-modal-header">
              <h2>{editingProject ? "Edit Item" : "Add New Item"}</h2>
              <button className="projects-modal-close" onClick={closeModal} disabled={uploading}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="projects-form">
              <div className="projects-form-body">
                <div className="projects-form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    disabled={uploading}
                  >
                    <option value="project">🚀 Project</option>
                    <option value="achievement">🏆 Achievement</option>
                  </select>
                </div>

                <div className="projects-form-group">
                  <label>Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter title" required disabled={uploading} />
                </div>

                <div className="projects-form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" rows="3" disabled={uploading} />
                </div>

                <div className="projects-form-group">
                  <label>Image</label>
                  <div className="projects-file-upload">
                    <input type="file" accept="image/*" onChange={handleFileChange} id="project-image" style={{ display: "none" }} disabled={uploading} />
                    <label htmlFor="project-image" className="projects-upload-label"><FaUpload /> {preview ? "Change Image" : "Choose Image"}</label>
                    {preview && (
                      <div className="projects-image-preview">
                        <img src={preview} alt="Preview" />
                        <button type="button" onClick={removeImage} disabled={uploading}>×</button>
                      </div>
                    )}
                    <p className="projects-upload-hint">Supported: JPG, PNG, GIF, WEBP (Max 5MB)</p>
                  </div>
                </div>

                {formData.type === "achievement" && (
                  <div className="projects-form-row">
                    <div className="projects-form-group">
                      <label>Date *</label>
                      <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required disabled={uploading} />
                    </div>
                    <div className="projects-form-group">
                      <label>Issuer</label>
                      <input type="text" value={formData.issuer} onChange={(e) => setFormData({ ...formData, issuer: e.target.value })} placeholder="e.g., Google, Hackathon 2024" disabled={uploading} />
                    </div>
                  </div>
                )}

                {formData.type === "project" && (
                  <div className="projects-form-row">
                    <div className="projects-form-group">
                      <label>Demo URL</label>
                      <input type="url" value={formData.demo_url} onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })} placeholder="https://..." disabled={uploading} />
                    </div>
                    <div className="projects-form-group">
                      <label>GitHub URL</label>
                      <input type="url" value={formData.github_url} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} placeholder="https://github.com/..." disabled={uploading} />
                    </div>
                  </div>
                )}

                <div className="projects-form-group">
                  <label>Technologies / Skills</label>
                  <div className="tech-input-group">
                    <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())} placeholder="Add a technology or skill" disabled={uploading} />
                    <Button type="button" onClick={handleAddTech} disabled={uploading}>Add</Button>
                  </div>
                  <div className="tech-list">
                    {formData.technologies.map((tech, index) => (
                      <span key={index} className="tech-badge">
                        {tech}
                        <button type="button" onClick={() => handleRemoveTech(index)} disabled={uploading}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="projects-modal-footer">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={uploading}>Cancel</Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? <><FaSpinner className="projects-spinner-icon" /> Saving...</> : editingProject ? "Update Item" : "Add Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .projects-page {
          min-height: 100vh;
          padding: 100px 0 60px;
          background: var(--bg-primary, #07070e);
        }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        
        /* Header */
        .projects-header { text-align: center; margin-bottom: 48px; }
        .projects-title { font-size: clamp(2rem, 5vw, 3rem); font-weight: 700; margin-bottom: 16px; }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #818cf8, #38bdf8, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .projects-subtitle { font-size: 1.1rem; color: rgba(255, 255, 255, 0.7); }
        
        /* Toolbar */
        .projects-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 16px; }
        .search-container { position: relative; flex: 1; max-width: 320px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: rgba(255, 255, 255, 0.4); font-size: 0.9rem; }
        .search-input { width: 100%; padding: 12px 16px 12px 42px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; color: white; font-size: 0.9rem; transition: all 0.3s ease; }
        .search-input:focus { outline: none; border-color: #a78bfa; background: rgba(255, 255, 255, 0.08); }
        
        /* Filter Buttons */
        .filter-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
        .filter-btn { display: flex; align-items: center; gap: 8px; padding: 8px 18px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 40px; color: rgba(255, 255, 255, 0.6); cursor: pointer; transition: all 0.3s ease; font-size: 0.85rem; font-weight: 500; }
        .filter-btn:hover { background: rgba(255, 255, 255, 0.08); color: white; }
        .filter-btn.active { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; border-color: transparent; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }
        
        /* Grid */
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px; }
        
        /* Card */
        .project-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          position: relative;
        }
        .project-card:hover {
          transform: translateY(-8px);
          border-color: rgba(167, 139, 250, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(167, 139, 250, 0.1);
        }
        
        /* Image Wrapper */
        .project-image-wrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
        }
        .project-image-link {
          display: block;
          height: 100%;
          text-decoration: none;
        }
        .project-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .project-card:hover .project-image {
          transform: scale(1.08);
        }
        
        /* Overlay */
        .project-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(79, 70, 229, 0.9));
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .project-image-link:hover .project-overlay {
          opacity: 1;
        }
        .view-details {
          padding: 10px 24px;
          background: white;
          color: #7c3aed;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          transform: translateY(20px);
          transition: transform 0.3s ease;
        }
        .project-image-link:hover .view-details {
          transform: translateY(0);
        }
        
        /* Type Badge */
        .project-type-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          backdrop-filter: blur(4px);
        }
        .project-type-badge.project { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
        .project-type-badge.achievement { background: linear-gradient(135deg, #10b981, #059669); }
        
        /* Actions */
        .project-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
        }
        .project-card:hover .project-actions {
          opacity: 1;
        }
        .action-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .action-btn:hover { transform: scale(1.1); background: rgba(0, 0, 0, 0.9); }
        .action-btn.edit { color: #fbbf24; }
        .action-btn.delete { color: #ef4444; }
        
        /* Content */
        .project-content { padding: 20px; }
        .project-title-link {
          text-decoration: none;
          display: block;
        }
        .project-title-link h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: white;
          line-height: 1.4;
          transition: color 0.3s ease;
        }
        .project-title-link:hover h3 {
          color: #a78bfa;
        }
        .project-content p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 12px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Achievement Meta */
        .achievement-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }
        .meta-item svg {
          font-size: 0.65rem;
          color: #a78bfa;
        }
        
        /* Tech Tags */
        .project-tech {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }
        .tech-tag {
          padding: 4px 10px;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 20px;
          font-size: 0.7rem;
          color: #a78bfa;
        }
        
        /* Links - Menggunakan button, bukan a tag */
        .project-links {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .link-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .link-button:hover {
          color: #a78bfa;
          transform: translateY(-2px);
        }
        
        /* Empty State */
        .projects-empty { text-align: center; padding: 80px 20px; }
        .empty-icon { font-size: 5rem; color: rgba(255, 255, 255, 0.05); margin-bottom: 20px; }
        .projects-empty h3 { font-size: 1.5rem; margin-bottom: 12px; color: white; }
        .projects-empty p { color: rgba(255, 255, 255, 0.5); margin-bottom: 28px; }
        
        /* Pagination */
        .projects-pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 48px; }
        .projects-pagination span { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; }
        
        /* Modal */
        .projects-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(12px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .projects-modal { max-width: 580px; width: 100%; max-height: 90vh; overflow-y: auto; background: #1a1a2e; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .projects-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .projects-modal-header h2 { font-size: 1.3rem; color: white; }
        .projects-modal-close { background: none; border: none; color: rgba(255, 255, 255, 0.6); font-size: 1.8rem; cursor: pointer; }
        .projects-modal-close:hover { color: white; }
        .projects-form-body { padding: 24px; }
        .projects-form-group { margin-bottom: 20px; }
        .projects-form-group label { display: block; margin-bottom: 8px; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; font-weight: 500; }
        .projects-form-group input, .projects-form-group textarea, .projects-form-group select { width: 100%; padding: 12px 14px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-size: 0.9rem; }
        .projects-form-group input:focus, .projects-form-group textarea:focus, .projects-form-group select:focus { outline: none; border-color: #a78bfa; background: rgba(255, 255, 255, 0.08); }
        .projects-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .projects-file-upload { display: flex; flex-direction: column; gap: 12px; }
        .projects-upload-label { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; cursor: pointer; width: fit-content; }
        .projects-upload-label:hover { background: rgba(255, 255, 255, 0.1); border-color: #a78bfa; }
        .projects-image-preview { position: relative; width: 140px; margin-top: 8px; }
        .projects-image-preview img { width: 100%; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .projects-image-preview button { position: absolute; top: -10px; right: -10px; width: 26px; height: 26px; background: #ef4444; border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .projects-upload-hint { font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); margin-top: 4px; }
        .tech-input-group { display: flex; gap: 10px; margin-bottom: 12px; }
        .tech-input-group input { flex: 1; }
        .tech-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .tech-badge { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 20px; font-size: 0.8rem; color: white; }
        .tech-badge button { background: none; border: none; color: white; cursor: pointer; font-size: 1rem; display: flex; align-items: center; }
        .projects-modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .projects-spinner-icon { animation: spin 1s linear infinite; margin-right: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .projects-toolbar { flex-direction: column; }
          .search-container { max-width: 100%; }
          .filter-buttons { justify-content: center; }
          .projects-grid { gap: 20px; }
          .projects-form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Projects;