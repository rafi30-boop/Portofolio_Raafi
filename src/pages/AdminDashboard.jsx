// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { certificatesAPI, projectsAPI, messagesAPI } from "../services/api";
import { supabase } from "../services/supabase";
import Button from "../styles/components/ui/Button";
import {
  FaCertificate,
  FaProjectDiagram,
  FaEnvelope,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaUpload,
  FaDownload,
  FaSpinner,
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaEnvelopeOpen,
  FaTrashAlt,
  FaCheck,
  FaClock,
  FaChartLine,
  FaGithub,
  FaExternalLinkAlt,
  FaFileAlt,
  FaImage,
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    certificates: 0,
    projects: 0,
    messages: 0,
    unreadMessages: 0,
    cv: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Certificate states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [certificateThumbnail, setCertificateThumbnail] = useState(null);
  const [certificateThumbnailPreview, setCertificateThumbnailPreview] = useState(null);
  const [certificateForm, setCertificateForm] = useState({
    title: "",
    issue_date: "",
    image_url: "",
    thumbnail_url: "",
  });
  
  // Project states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectImageFile, setProjectImageFile] = useState(null);
  const [projectPreview, setProjectPreview] = useState(null);
  const [uploadingProject, setUploadingProject] = useState(false);
  const [projectTechInput, setProjectTechInput] = useState("");
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    image_file: "",
    demo_url: "",
    github_url: "",
    technologies: [],
    type: "project",
  });
  
  // CV states
  const [showCvModal, setShowCvModal] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  
  // Message states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [certificatesData, projectsData, messagesData] = await Promise.all([
        certificatesAPI.getAll(),
        projectsAPI.getAll(),
        messagesAPI.getAll(),
      ]);

      const { data: cvDataResult, error: cvError } = await supabase
        .from("cv_files")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cvError && cvDataResult) {
        setCvData(cvDataResult);
      } else {
        setCvData(null);
      }

      setCertificates(certificatesData || []);
      setProjects(projectsData || []);
      setMessages(messagesData || []);
      setStats({
        certificates: certificatesData?.length || 0,
        projects: projectsData?.length || 0,
        messages: messagesData?.length || 0,
        unreadMessages: messagesData?.filter((m) => !m.is_read).length || 0,
        cv: cvDataResult ? 1 : 0,
      });
      setRecentMessages(messagesData?.slice(0, 4) || []);
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load data: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const extractStoragePath = (url, bucket = "certificates") => {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) return url.substring(idx + marker.length);
    const parts = url.split(`${bucket}/`);
    return parts.length > 1 ? parts[parts.length - 1] : null;
  };

  // ==================== CERTIFICATE FUNCTIONS ====================
  const uploadCertificateFile = async (file) => {
    if (!file) return null;

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `certificates/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const uploadCertificateThumbnail = async (file) => {
    if (!file) return null;

    if (!file.type.startsWith('image/')) {
      throw new Error('Thumbnail must be an image file');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Thumbnail size must be less than 2MB');
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `certificates/thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleCertificateFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setCertificateFile(selectedFile);
    
    if (selectedFile.type.startsWith('image/')) {
      if (certificatePreview && certificatePreview.startsWith("blob:")) {
        URL.revokeObjectURL(certificatePreview);
      }
      setCertificatePreview(URL.createObjectURL(selectedFile));
    } else {
      setCertificatePreview(null);
      toast.success(`File "${selectedFile.name}" selected`, { icon: '📎' });
    }
  };

  const handleCertificateThumbnailChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Thumbnail must be an image file");
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error("Thumbnail size must be less than 2MB");
      return;
    }

    setCertificateThumbnail(selectedFile);
    if (certificateThumbnailPreview && certificateThumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(certificateThumbnailPreview);
    }
    setCertificateThumbnailPreview(URL.createObjectURL(selectedFile));
  };

  const removeCertificateFile = () => {
    if (certificatePreview && certificatePreview.startsWith("blob:")) {
      URL.revokeObjectURL(certificatePreview);
    }
    setCertificateFile(null);
    setCertificatePreview(null);
  };

  const removeCertificateThumbnail = () => {
    if (certificateThumbnailPreview && certificateThumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(certificateThumbnailPreview);
    }
    setCertificateThumbnail(null);
    setCertificateThumbnailPreview(null);
    setCertificateForm({ ...certificateForm, thumbnail_url: "" });
  };

  const handleAddCertificate = async () => {
    if (!certificateForm.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!certificateForm.issue_date) {
      toast.error("Issue date is required");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(certificateForm.issue_date)) {
      toast.error("Issue date must be in YYYY-MM-DD format");
      return;
    }

    const selectedDate = new Date(certificateForm.issue_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) {
      toast.error("Issue date cannot be in the future");
      return;
    }

    try {
      setUploadingImage(true);
      let fileUrl = certificateForm.image_url;
      let thumbnailUrl = certificateForm.thumbnail_url;

      if (certificateFile) {
        fileUrl = await uploadCertificateFile(certificateFile);
      }
      
      if (certificateThumbnail) {
        thumbnailUrl = await uploadCertificateThumbnail(certificateThumbnail);
      }

      const payload = {
        title: certificateForm.title.trim(),
        issue_date: certificateForm.issue_date,
        image_url: fileUrl,
        thumbnail_url: thumbnailUrl,
      };

      console.log("📤 Sending certificate payload:", payload);

      if (editingCertificate) {
        await certificatesAPI.update(editingCertificate.id, payload);
        toast.success("Certificate updated successfully");
      } else {
        await certificatesAPI.create(payload);
        toast.success("Certificate added successfully");
      }

      await loadAllData();
      closeCertificateModal();
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error(error.message || "Failed to save certificate");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificate(certificate);
    setCertificateForm({
      title: certificate.title || "",
      issue_date: certificate.issue_date || "",
      image_url: certificate.image_url || "",
      thumbnail_url: certificate.thumbnail_url || "",
    });
    const isImage = certificate.image_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    setCertificatePreview(isImage ? certificate.image_url : null);
    setCertificateThumbnailPreview(certificate.thumbnail_url || null);
    setCertificateFile(null);
    setCertificateThumbnail(null);
    setShowCertificateModal(true);
  };

  const handleDeleteCertificate = async (id) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      try {
        const certToDelete = certificates.find((c) => c.id === id);
        if (certToDelete?.image_url) {
          const storagePath = extractStoragePath(certToDelete.image_url, "certificates");
          if (storagePath) {
            await supabase.storage
              .from("certificates")
              .remove([storagePath])
              .catch((err) => console.error("Error deleting file:", err));
          }
        }
        if (certToDelete?.thumbnail_url) {
          const thumbPath = extractStoragePath(certToDelete.thumbnail_url, "certificates");
          if (thumbPath) {
            await supabase.storage
              .from("certificates")
              .remove([thumbPath])
              .catch((err) => console.error("Error deleting thumbnail:", err));
          }
        }
        await certificatesAPI.delete(id);
        toast.success("Certificate deleted successfully");
        await loadAllData();
      } catch (error) {
        console.error("Error deleting certificate:", error);
        toast.error("Failed to delete certificate");
      }
    }
  };

  const closeCertificateModal = () => {
    if (certificatePreview && certificatePreview.startsWith("blob:")) {
      URL.revokeObjectURL(certificatePreview);
    }
    if (certificateThumbnailPreview && certificateThumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(certificateThumbnailPreview);
    }
    setShowCertificateModal(false);
    setEditingCertificate(null);
    setCertificateForm({ title: "", issue_date: "", image_url: "", thumbnail_url: "" });
    setCertificateFile(null);
    setCertificatePreview(null);
    setCertificateThumbnail(null);
    setCertificateThumbnailPreview(null);
  };

  // ==================== PROJECT FUNCTIONS ====================
  const uploadProjectImage = async (file) => {
    if (!file) return null;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Use JPG, PNG, GIF, or WEBP');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("projects")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("projects")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleProjectFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    setProjectImageFile(selectedFile);
    if (projectPreview && projectPreview.startsWith("blob:")) {
      URL.revokeObjectURL(projectPreview);
    }
    setProjectPreview(URL.createObjectURL(selectedFile));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selectedFile = e.dataTransfer.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    setProjectImageFile(selectedFile);
    if (projectPreview && projectPreview.startsWith("blob:")) {
      URL.revokeObjectURL(projectPreview);
    }
    setProjectPreview(URL.createObjectURL(selectedFile));
  };

  const removeProjectImage = () => {
    if (projectPreview && projectPreview.startsWith("blob:")) {
      URL.revokeObjectURL(projectPreview);
    }
    setProjectImageFile(null);
    setProjectPreview(null);
    setProjectForm({ ...projectForm, image_file: "" });
  };

  const handleAddProjectTech = () => {
    if (projectTechInput.trim()) {
      setProjectForm({
        ...projectForm,
        technologies: [...projectForm.technologies, projectTechInput.trim()],
      });
      setProjectTechInput("");
    }
  };

  const handleRemoveProjectTech = (index) => {
    setProjectForm({
      ...projectForm,
      technologies: projectForm.technologies.filter((_, i) => i !== index),
    });
  };

  const handleAddProject = async () => {
    if (!projectForm.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setUploadingProject(true);
      let imageUrl = projectForm.image_file;

      if (projectImageFile) {
        imageUrl = await uploadProjectImage(projectImageFile);
      }

      const payload = {
        title: projectForm.title.trim(),
        description: projectForm.description || "",
        image_file: imageUrl || "",
        demo_url: projectForm.demo_url || "",
        github_url: projectForm.github_url || "",
        technologies: projectForm.technologies,
        type: projectForm.type,
      };

      console.log("📤 Sending project payload:", payload);

      if (editingProject) {
        await projectsAPI.update(editingProject.id, payload);
        toast.success("Project updated successfully");
      } else {
        await projectsAPI.create(payload);
        toast.success("Project added successfully");
      }

      await loadAllData();
      closeProjectModal();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(error.message || "Failed to save project");
    } finally {
      setUploadingProject(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      image_file: project.image_file || "",
      demo_url: project.demo_url || "",
      github_url: project.github_url || "",
      technologies: project.technologies || [],
      type: project.type || "project",
    });
    setProjectPreview(project.image_file || null);
    setProjectImageFile(null);
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsAPI.delete(id);
        toast.success("Project deleted successfully");
        await loadAllData();
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      }
    }
  };

  const closeProjectModal = () => {
    if (projectPreview && projectPreview.startsWith("blob:")) {
      URL.revokeObjectURL(projectPreview);
    }
    setShowProjectModal(false);
    setEditingProject(null);
    setProjectForm({
      title: "",
      description: "",
      image_file: "",
      demo_url: "",
      github_url: "",
      technologies: [],
      type: "project",
    });
    setProjectImageFile(null);
    setProjectPreview(null);
    setProjectTechInput("");
  };

  // ==================== CV FUNCTIONS ====================
  const handleCvUpload = async () => {
    if (!cvFile) {
      toast.error("Please select a file");
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(cvFile.type)) {
      toast.error("Please select a PDF or Word document");
      return;
    }

    if (cvFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setUploadingCv(true);
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `cv_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("cv-files")
        .upload(filePath, cvFile, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("cv-files")
        .getPublicUrl(filePath);

      if (cvData) {
        await supabase.storage
          .from("cv-files")
          .remove([cvData.file_path])
          .catch((err) => console.error("Error removing old CV:", err));
        await supabase.from("cv_files").delete().eq("id", cvData.id);
      }

      const { error: dbError } = await supabase.from("cv_files").insert([
        {
          file_name: cvFile.name,
          file_path: filePath,
          file_size: cvFile.size,
          file_type: cvFile.type,
          public_url: publicUrlData.publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      toast.success("CV uploaded successfully!");
      setShowCvModal(false);
      setCvFile(null);
      await loadAllData();
    } catch (error) {
      console.error("Error uploading CV:", error);
      toast.error("Failed to upload CV");
    } finally {
      setUploadingCv(false);
    }
  };

  const handleDeleteCv = async () => {
    if (!cvData) return;
    if (!window.confirm("Are you sure you want to delete the CV?")) return;

    try {
      await supabase.storage
        .from("cv-files")
        .remove([cvData.file_path])
        .catch((err) => console.error("Error removing CV file:", err));
      await supabase.from("cv_files").delete().eq("id", cvData.id);
      setCvData(null);
      toast.success("CV deleted successfully");
      await loadAllData();
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Failed to delete CV");
    }
  };

  // ==================== MESSAGE FUNCTIONS ====================
  const handleMarkAsRead = async (messageId) => {
    try {
      await messagesAPI.markAsRead(messageId);
      toast.success("Message marked as read");
      await loadAllData();
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await messagesAPI.delete(id);
        toast.success("Message deleted successfully");
        if (selectedMessage?.id === id) setShowMessageModal(false);
        await loadAllData();
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message");
      }
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.subject || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "read"
          ? message.is_read
          : !message.is_read;

    return matchesSearch && matchesFilter;
  });

  const statCards = [
    {
      title: "Certificates",
      value: stats.certificates,
      icon: FaCertificate,
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.1)",
      onClick: () => setActiveTab("certificates"),
    },
    {
      title: "Projects",
      value: stats.projects,
      icon: FaProjectDiagram,
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.1)",
      onClick: () => setActiveTab("projects"),
    },
    {
      title: "CV",
      value: stats.cv,
      icon: FaFilePdf,
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.1)",
      onClick: () => setActiveTab("cv"),
    },
    {
      title: "Messages",
      value: stats.messages,
      icon: FaEnvelope,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.1)",
      onClick: () => setActiveTab("messages"),
    },
    {
      title: "Unread",
      value: stats.unreadMessages,
      icon: FaEnvelopeOpen,
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.1)",
      onClick: () => setActiveTab("messages"),
    },
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title gradient-text">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage your portfolio content and view analytics
          </p>
        </div>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <FaChartLine /> Overview
          </button>
          <button
            className={`admin-tab ${activeTab === "certificates" ? "active" : ""}`}
            onClick={() => setActiveTab("certificates")}
          >
            <FaCertificate /> Certificates
          </button>
          <button
            className={`admin-tab ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            <FaProjectDiagram /> Projects
          </button>
          <button
            className={`admin-tab ${activeTab === "cv" ? "active" : ""}`}
            onClick={() => setActiveTab("cv")}
          >
            <FaFilePdf /> CV
          </button>
          <button
            className={`admin-tab ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            <FaEnvelope /> Messages
            {stats.unreadMessages > 0 && (
              <span className="tab-badge">{stats.unreadMessages}</span>
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="overview-container">
            <div className="stats-grid">
              {statCards.map((stat) => (
                <div
                  key={stat.title}
                  className="stat-card"
                  onClick={stat.onClick}
                  style={{ cursor: "pointer" }}
                >
                  <div className="stat-card-icon" style={{ background: stat.bg }}>
                    <stat.icon style={{ color: stat.color }} />
                  </div>
                  <div className="stat-card-info">
                    <h3>{stat.value}</h3>
                    <p>{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="recent-messages-section">
              <div className="section-title">
                <h2>Recent Messages</h2>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("messages")}>
                  View All
                </Button>
              </div>

              {recentMessages.length === 0 ? (
                <div className="empty-messages">
                  <FaEnvelope className="empty-icon" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="messages-list">
                  {recentMessages.map((message) => (
                    <div key={message.id} className={`message-item ${!message.is_read ? "unread" : ""}`}>
                      <div className="message-avatar">
                        <FaUser />
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <div className="message-sender">
                            <strong>{message.name}</strong>
                            <span>{message.email}</span>
                          </div>
                          <div className="message-date">
                            <FaClock />
                            <span>{new Date(message.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="message-subject">{message.subject || "No subject"}</p>
                        <p className="message-preview">{message.message.substring(0, 80)}...</p>
                      </div>
                      <div className="message-actions">
                        {!message.is_read && (
                          <button onClick={() => handleMarkAsRead(message.id)} className="action-mark-read" title="Mark as read">
                            <FaCheck />
                          </button>
                        )}
                        <button onClick={() => { setSelectedMessage(message); setShowMessageModal(true); }} className="action-view" title="View details">
                          <FaEye />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === "certificates" && (
          <div className="certificates-container">
            <div className="section-title">
              <h2>Manage Certificates</h2>
              <Button onClick={() => setShowCertificateModal(true)}>
                <FaPlus /> Add Certificate
              </Button>
            </div>

            {certificates.length === 0 ? (
              <div className="empty-state">
                <FaCertificate className="empty-icon" />
                <h3>No certificates yet</h3>
                <p>Add your first certificate to get started</p>
                <Button onClick={() => setShowCertificateModal(true)}>
                  <FaPlus /> Add Certificate
                </Button>
              </div>
            ) : (
              <div className="certificates-list">
                {certificates.map((cert) => (
                  <div key={cert.id} className="certificate-item">
                    {cert.thumbnail_url ? (
                      <img
                        src={cert.thumbnail_url}
                        alt={cert.title}
                        className="certificate-image"
                        onError={(e) => { e.target.src = "https://placehold.co/60x60/1a1a2e/ffffff?text=Cert"; }}
                      />
                    ) : cert.image_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={cert.image_url}
                        alt={cert.title}
                        className="certificate-image"
                        onError={(e) => { e.target.src = "https://placehold.co/60x60/1a1a2e/ffffff?text=Cert"; }}
                      />
                    ) : (
                      <div className="certificate-file-icon">
                        {cert.image_url?.includes('.pdf') ? <FaFilePdf size={30} /> : 
                         cert.image_url?.includes('.doc') ? <FaFileWord size={30} /> : 
                         <FaFileAlt size={30} />}
                      </div>
                    )}
                    <div className="certificate-info">
                      <h3>{cert.title}</h3>
                      <p className="certificate-date">
                        <FaCalendarAlt /> {new Date(cert.issue_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="certificate-actions">
                      <button onClick={() => handleEditCertificate(cert)} className="action-btn edit" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteCertificate(cert.id)} className="action-btn delete" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="projects-container">
            <div className="section-title">
              <h2>Manage Projects</h2>
              <Button onClick={() => setShowProjectModal(true)}>
                <FaPlus /> Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="empty-state">
                <FaProjectDiagram className="empty-icon" />
                <h3>No projects yet</h3>
                <p>Add your projects to showcase your work</p>
                <Button onClick={() => setShowProjectModal(true)}>
                  <FaPlus /> Add Project
                </Button>
              </div>
            ) : (
              <div className="projects-list">
                {projects.map((project) => (
                  <div key={project.id} className="project-item">
                    <img
                      src={project.image_file || "https://placehold.co/60x60/1a1a2e/ffffff?text=Proj"}
                      alt={project.title}
                      className="project-image"
                      onError={(e) => { e.target.src = "https://placehold.co/60x60/1a1a2e/ffffff?text=Proj"; }}
                    />
                    <div className="project-info">
                      <h3>{project.title}</h3>
                      <p>{project.description?.substring(0, 60)}...</p>
                      <div className="project-tech">
                        {project.technologies?.slice(0, 2).map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                        {project.technologies?.length > 2 && (
                          <span className="tech-tag">+{project.technologies.length - 2}</span>
                        )}
                      </div>
                    </div>
                    <div className="project-actions">
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="action-btn view" title="Live Demo">
                          <FaEye />
                        </a>
                      )}
                      <button onClick={() => handleEditProject(project)} className="action-btn edit" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="action-btn delete" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CV Tab */}
        {activeTab === "cv" && (
          <div className="cv-container">
            <div className="section-title">
              <h2>Manage CV</h2>
              <Button onClick={() => setShowCvModal(true)}>
                <FaUpload /> {cvData ? "Update CV" : "Upload CV"}
              </Button>
            </div>

            {!cvData ? (
              <div className="empty-state">
                <FaFilePdf className="empty-icon" />
                <h3>No CV Uploaded</h3>
                <p>Upload your CV to make it available for download</p>
                <Button onClick={() => setShowCvModal(true)}>
                  <FaUpload /> Upload CV
                </Button>
              </div>
            ) : (
              <div className="cv-preview">
                <div className="cv-icon">
                  {cvData.file_type?.includes("pdf") ? <FaFilePdf /> : <FaFileWord />}
                </div>
                <div className="cv-details">
                  <h3>{cvData.file_name}</h3>
                  <div className="cv-meta">
                    <span>Size: {(cvData.file_size / 1024).toFixed(2)} KB</span>
                    <span>Uploaded: {new Date(cvData.created_at).toLocaleDateString()}</span>
                    <span className="cv-type">{cvData.file_type?.includes("pdf") ? "PDF" : "Word"}</span>
                  </div>
                </div>
                <div className="cv-actions">
                  <a href={cvData.public_url} target="_blank" rel="noopener noreferrer" className="btn-view">
                    <FaEye /> View
                  </a>
                  <a href={cvData.public_url} download={cvData.file_name} className="btn-download">
                    <FaDownload /> Download
                  </a>
                  <button onClick={handleDeleteCv} className="btn-delete">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="messages-container">
            <div className="section-title">
              <h2>All Messages</h2>
              <div className="message-stats">
                <span className="stat-badge">Total: {messages.length}</span>
                <span className="stat-badge unread">Unread: {stats.unreadMessages}</span>
              </div>
            </div>

            <div className="messages-filters">
              <div className="search-input-wrapper">
                <FaSearch />
                <input type="text" placeholder="Search by name, email, or subject..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="filter-group">
                <button className={`filter-btn ${filterStatus === "all" ? "active" : ""}`} onClick={() => setFilterStatus("all")}>All</button>
                <button className={`filter-btn ${filterStatus === "unread" ? "active" : ""}`} onClick={() => setFilterStatus("unread")}>Unread</button>
                <button className={`filter-btn ${filterStatus === "read" ? "active" : ""}`} onClick={() => setFilterStatus("read")}>Read</button>
              </div>
            </div>

            {filteredMessages.length === 0 ? (
              <div className="empty-state">
                <FaEnvelope className="empty-icon" />
                <h3>No messages found</h3>
                <p>{searchTerm ? "Try a different search term" : "No messages yet"}</p>
              </div>
            ) : (
              <div className="messages-table-wrapper">
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Sender</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map((message) => (
                      <tr key={message.id} className={!message.is_read ? "unread-row" : ""}>
                        <td>
                          <div className="sender-info">
                            <strong>{message.name}</strong>
                            <span>{message.email}</span>
                          </div>
                        </td>
                        <td>{message.subject || "-"}</td>
                        <td>{new Date(message.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status ${message.is_read ? "read" : "unread"}`}>
                            {message.is_read ? "Read" : "Unread"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!message.is_read && (
                              <button onClick={() => handleMarkAsRead(message.id)} className="action-icon read" title="Mark as read">
                                <FaCheck />
                              </button>
                            )}
                            <button onClick={() => { setSelectedMessage(message); setShowMessageModal(true); }} className="action-icon view" title="View details">
                              <FaEye />
                            </button>
                            <button onClick={() => handleDeleteMessage(message.id)} className="action-icon delete" title="Delete">
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Certificate Modal with Thumbnail Upload */}
      {showCertificateModal && (
        <div className="modal-overlay" onClick={() => !uploadingImage && closeCertificateModal()}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h2>{editingCertificate ? "Edit Certificate" : "Add Certificate"}</h2>
              <button className="modal-close" onClick={closeCertificateModal} disabled={uploadingImage}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" placeholder="Certificate title" value={certificateForm.title} onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })} disabled={uploadingImage} />
              </div>
              <div className="form-group">
                <label>Issue Date <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="date" value={certificateForm.issue_date} onChange={(e) => setCertificateForm({ ...certificateForm, issue_date: e.target.value })} disabled={uploadingImage} max={new Date().toISOString().split('T')[0]} />
              </div>
              
              {/* THUMBNAIL UPLOAD - Untuk tampilan card */}
              <div className="form-group">
                <label>
                  Thumbnail Image (For Card Display)
                  <span style={{ color: "#fbbf24", fontSize: "0.7rem", marginLeft: "8px" }}>
                    (Recommended: 400x300, JPG/PNG/GIF/WEBP, max 2MB)
                  </span>
                </label>
                <div className="certificates-file-upload">
                  <label className="certificates-upload-label" style={uploadingImage ? { opacity: 0.6, cursor: "not-allowed" } : {}}>
                    <FaImage style={{ fontSize: "0.8rem" }} />
                    <span>{certificateThumbnail ? "Change Thumbnail" : "Upload Thumbnail"}</span>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      onChange={handleCertificateThumbnailChange} 
                      style={{ display: "none" }} 
                      disabled={uploadingImage} 
                    />
                  </label>
                  <span className="certificates-upload-hint">
                    JPG, PNG, GIF, WEBP — max 2MB (Recommended: 400x300)
                  </span>
                  
                  {certificateThumbnailPreview && (
                    <div className="certificates-image-preview">
                      <img src={certificateThumbnailPreview} alt="Thumbnail Preview" />
                      {!uploadingImage && (
                        <button type="button" onClick={removeCertificateThumbnail} title="Remove thumbnail">
                          <FaTimes style={{ fontSize: "0.6rem" }} />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {certificateForm.thumbnail_url && !certificateThumbnail && (
                    <div className="file-info">
                      <div className="file-icon">🖼️</div>
                      <div className="file-details">
                        <strong>Current thumbnail</strong>
                        <span>{certificateForm.thumbnail_url.split('/').pop()?.substring(0, 40)}...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* MAIN FILE UPLOAD - PDF/Document */}
              <div className="form-group">
                <label>Certificate File (PDF, Word, Image, etc.)</label>
                <div className="certificates-file-upload">
                  <label className="certificates-upload-label" style={uploadingImage ? { opacity: 0.6, cursor: "not-allowed" } : {}}>
                    <FaUpload style={{ fontSize: "0.8rem" }} />
                    <span>{certificateFile ? "Change File" : "Upload File"}</span>
                    <input 
                      type="file" 
                      accept="*/*" 
                      onChange={handleCertificateFileChange} 
                      style={{ display: "none" }} 
                      disabled={uploadingImage} 
                    />
                  </label>
                  <span className="certificates-upload-hint">
                    Any file type accepted (PDF, DOC, etc.) — Max 10MB
                  </span>
                  
                  {certificatePreview && certificatePreview.startsWith('blob:') && (
                    <div className="certificates-image-preview">
                      <img src={certificatePreview} alt="Preview" />
                      {!uploadingImage && <button type="button" onClick={removeCertificateFile}>×</button>}
                    </div>
                  )}
                  
                  {certificateFile && !certificatePreview && (
                    <div className="file-info">
                      <div className="file-icon">
                        {certificateFile.type.includes('pdf') ? '📄' : 
                         certificateFile.type.includes('word') ? '📝' : 
                         certificateFile.type.includes('image') ? '🖼️' : '📎'}
                      </div>
                      <div className="file-details">
                        <strong>{certificateFile.name}</strong>
                        <span>{(certificateFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      {!uploadingImage && (
                        <button type="button" onClick={removeCertificateFile} className="remove-file">×</button>
                      )}
                    </div>
                  )}
                  
                  {certificateForm.image_url && !certificateFile && (
                    <div className="file-info">
                      <div className="file-icon">
                        {certificateForm.image_url.includes('.pdf') ? '📄' : 
                         certificateForm.image_url.includes('.doc') ? '📝' : 
                         certificateForm.image_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? '🖼️' : '📎'}
                      </div>
                      <div className="file-details">
                        <strong>Current file</strong>
                        <span>{certificateForm.image_url.split('/').pop()?.substring(0, 40)}...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={closeCertificateModal} disabled={uploadingImage}>Cancel</Button>
              <Button onClick={handleAddCertificate} disabled={uploadingImage}>
                {uploadingImage ? <><FaSpinner className="spinner-icon" /> Saving...</> : editingCertificate ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => !uploadingProject && closeProjectModal()}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
            <div className="modal-header">
              <h2>{editingProject ? "Edit Project" : "Add Project"}</h2>
              <button className="modal-close" onClick={closeProjectModal} disabled={uploadingProject}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input 
                  type="text" 
                  placeholder="Project title" 
                  value={projectForm.title} 
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} 
                  disabled={uploadingProject} 
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3" 
                  placeholder="Project description" 
                  value={projectForm.description} 
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} 
                  disabled={uploadingProject} 
                />
              </div>

              {/* Project Image Upload */}
              <div className="form-group">
                <label>
                  Project Image 
                  <span style={{ color: "#fbbf24", fontSize: "0.7rem", marginLeft: "8px" }}>
                    (JPG/PNG/GIF/WEBP, max 5MB)
                  </span>
                </label>
                <div 
                  className="project-image-upload-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${projectPreview ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    background: projectPreview ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  {!projectPreview ? (
                    <label className="image-upload-label" style={uploadingProject ? { opacity: 0.6, cursor: "not-allowed" } : {}}>
                      <div className="upload-icon-wrapper">
                        <FaImage className="upload-icon" />
                      </div>
                      <div className="upload-text">
                        <strong>Click to upload</strong>
                        <span>or drag and drop</span>
                      </div>
                      <div className="upload-hint">
                        PNG, JPG, GIF, WEBP up to 5MB
                      </div>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/gif,image/webp" 
                        onChange={handleProjectFileChange} 
                        style={{ display: "none" }} 
                        disabled={uploadingProject} 
                      />
                    </label>
                  ) : (
                    <div className="image-preview-container">
                      <div className="image-preview-wrapper">
                        <img 
                          src={projectPreview} 
                          alt="Project thumbnail preview" 
                          className="image-preview"
                        />
                        {!uploadingProject && (
                          <button 
                            type="button" 
                            onClick={removeProjectImage} 
                            className="remove-image-btn"
                            title="Remove image"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                      <div className="image-preview-actions">
                        <label className="change-image-btn" style={uploadingProject ? { opacity: 0.6, cursor: "not-allowed" } : {}}>
                          <FaUpload />
                          <span>Change Image</span>
                          <input 
                            type="file" 
                            accept="image/jpeg,image/png,image/gif,image/webp" 
                            onChange={handleProjectFileChange} 
                            style={{ display: "none" }} 
                            disabled={uploadingProject} 
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Demo URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com" 
                    value={projectForm.demo_url} 
                    onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })} 
                    disabled={uploadingProject} 
                  />
                </div>
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input 
                    type="url" 
                    placeholder="https://github.com/username/repo" 
                    value={projectForm.github_url} 
                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })} 
                    disabled={uploadingProject} 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Technologies</label>
                <div className="tech-input-group" style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <input 
                    type="text" 
                    placeholder="e.g., React, Node.js, MongoDB" 
                    value={projectTechInput} 
                    onChange={(e) => setProjectTechInput(e.target.value)} 
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddProjectTech())} 
                    disabled={uploadingProject} 
                    style={{ flex: 1 }}
                  />
                  <Button type="button" onClick={handleAddProjectTech} disabled={uploadingProject} size="sm">
                    Add
                  </Button>
                </div>
                <div className="tech-list" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {projectForm.technologies.length === 0 ? (
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
                      No technologies added yet
                    </span>
                  ) : (
                    projectForm.technologies.map((tech, index) => (
                      <span key={index} className="tech-badge" style={{ 
                        background: "rgba(139, 92, 246, 0.2)", 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        fontSize: "0.8rem", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px" 
                      }}>
                        {tech}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveProjectTech(index)} 
                          style={{ 
                            background: "none", 
                            border: "none", 
                            color: "#ef4444", 
                            cursor: "pointer",
                            fontSize: "1rem",
                            fontWeight: "bold"
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={closeProjectModal} disabled={uploadingProject}>Cancel</Button>
              <Button onClick={handleAddProject} disabled={uploadingProject}>
                {uploadingProject ? <><FaSpinner className="spinner-icon" /> Saving...</> : editingProject ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CV Modal */}
      {showCvModal && (
        <div className="modal-overlay" onClick={() => !uploadingCv && setShowCvModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{cvData ? "Update CV" : "Upload CV"}</h2>
              <button className="modal-close" onClick={() => !uploadingCv && setShowCvModal(false)} disabled={uploadingCv}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select CV File (PDF or Word)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files[0])} disabled={uploadingCv} />
                <small>Max size: 10MB. Supported: PDF, DOC, DOCX</small>
              </div>
              {cvFile && (
                <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                  Selected: {cvFile.name} ({(cvFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => { setShowCvModal(false); setCvFile(null); }} disabled={uploadingCv}>Cancel</Button>
              <Button onClick={handleCvUpload} disabled={!cvFile || uploadingCv}>
                {uploadingCv ? <><FaSpinner className="spinner-icon" /> Uploading...</> : cvData ? "Update" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showMessageModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal message-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Message Details</h2>
              <button className="modal-close" onClick={() => setShowMessageModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <label>From:</label>
                <p><strong>{selectedMessage.name}</strong> ({selectedMessage.email})</p>
              </div>
              <div className="detail-item">
                <label>Date:</label>
                <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <label>Subject:</label>
                <p>{selectedMessage.subject || "No subject"}</p>
              </div>
              <div className="detail-item">
                <label>Message:</label>
                <div className="message-body">{selectedMessage.message}</div>
              </div>
            </div>
            <div className="modal-footer">
              {!selectedMessage.is_read && (
                <Button onClick={() => { handleMarkAsRead(selectedMessage.id); setShowMessageModal(false); }}>
                  <FaCheckCircle /> Mark as Read
                </Button>
              )}
              <Button variant="secondary" onClick={() => handleDeleteMessage(selectedMessage.id)}>
                <FaTrash /> Delete
              </Button>
              <Button variant="secondary" onClick={() => setShowMessageModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          padding: 100px 0 60px;
          background: #07070e;
        }
        .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .admin-header { text-align: center; margin-bottom: 32px; }
        .admin-title { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
        .gradient-text { background: linear-gradient(135deg, #a78bfa, #818cf8, #38bdf8, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .admin-subtitle { color: rgba(255, 255, 255, 0.5); font-size: 0.9rem; }
        .admin-tabs { display: flex; gap: 8px; margin-bottom: 32px; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap; }
        .admin-tab { display: flex; align-items: center; gap: 8px; padding: 8px 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.6); font-size: 0.85rem; font-weight: 500; cursor: pointer; border-radius: 40px; transition: all 0.3s ease; }
        .admin-tab:hover { color: white; background: rgba(255, 255, 255, 0.08); }
        .admin-tab.active { color: #a78bfa; background: rgba(167, 139, 250, 0.15); border-color: rgba(167, 139, 250, 0.3); }
        .tab-badge { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #f59e0b; color: #000; border-radius: 50%; font-size: 0.65rem; font-weight: 700; margin-left: 6px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; transition: all 0.3s ease; cursor: pointer; }
        .stat-card:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.15); }
        .stat-card-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; font-size: 1.3rem; flex-shrink: 0; }
        .stat-card-info h3 { font-size: 1.8rem; font-weight: 700; color: white; line-height: 1; }
        .stat-card-info p { font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); margin-top: 4px; }
        .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .section-title h2 { font-size: 1.2rem; color: white; }
        .recent-messages-section { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; }
        .messages-list { display: flex; flex-direction: column; gap: 12px; }
        .message-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; transition: all 0.3s ease; }
        .message-item:hover { background: rgba(255, 255, 255, 0.05); }
        .message-item.unread { background: rgba(167, 139, 250, 0.05); border-left: 2px solid #a78bfa; }
        .message-avatar { width: 40px; height: 40px; background: rgba(167, 139, 250, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #a78bfa; flex-shrink: 0; }
        .message-content { flex: 1; min-width: 0; }
        .message-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
        .message-sender strong { color: white; font-size: 0.85rem; }
        .message-sender span { font-size: 0.7rem; color: rgba(255, 255, 255, 0.5); margin-left: 8px; }
        .message-date { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: rgba(255, 255, 255, 0.4); }
        .message-subject { font-size: 0.8rem; font-weight: 500; color: white; margin-bottom: 4px; }
        .message-preview { font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .message-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .action-mark-read, .action-view { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
        .action-mark-read { color: #10b981; }
        .action-view { color: #38bdf8; }
        .action-mark-read:hover, .action-view:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.05); }
        .empty-messages, .empty-state { text-align: center; padding: 40px 20px; }
        .empty-icon { font-size: 3rem; color: rgba(255, 255, 255, 0.05); margin-bottom: 12px; }
        .empty-messages p, .empty-state p { color: rgba(255, 255, 255, 0.4); font-size: 0.85rem; margin-bottom: 16px; }
        .empty-state h3 { font-size: 1.1rem; margin-bottom: 8px; color: white; }
        .certificates-list, .projects-list { display: flex; flex-direction: column; gap: 12px; }
        .certificate-item, .project-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; transition: all 0.3s ease; }
        .certificate-item:hover, .project-item:hover { background: rgba(255, 255, 255, 0.05); }
        .certificate-image, .project-image { width: 56px; height: 56px; object-fit: cover; border-radius: 10px; flex-shrink: 0; }
        .certificate-file-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: rgba(139, 92, 246, 0.15); border-radius: 10px; color: #a78bfa; }
        .certificate-info, .project-info { flex: 1; min-width: 0; }
        .certificate-info h3, .project-info h3 { font-size: 0.95rem; margin-bottom: 4px; color: white; }
        .certificate-info p, .project-info p { font-size: 0.75rem; color: rgba(255, 255, 255, 0.5); }
        .certificate-date { font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .project-tech { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .tech-tag { padding: 2px 8px; background: rgba(139, 92, 246, 0.15); border-radius: 4px; font-size: 0.65rem; color: #a78bfa; }
        .certificate-actions, .project-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; text-decoration: none; }
        .action-btn.view { color: #38bdf8; }
        .action-btn.edit { color: #fbbf24; }
        .action-btn.delete { color: #ef4444; }
        .action-btn:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.05); }
        .cv-container { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; }
        .cv-preview { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .cv-icon { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.15); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ef4444; flex-shrink: 0; }
        .cv-details { flex: 1; min-width: 0; }
        .cv-details h3 { font-size: 1rem; margin-bottom: 4px; color: white; }
        .cv-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .cv-meta span { font-size: 0.7rem; color: rgba(255, 255, 255, 0.5); }
        .cv-type { padding: 2px 8px; background: rgba(167, 139, 250, 0.15); border-radius: 4px; color: #a78bfa; }
        .cv-actions { display: flex; gap: 8px; }
        .btn-view, .btn-download, .btn-delete { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; text-decoration: none; cursor: pointer; transition: all 0.3s ease; border: none; }
        .btn-view { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
        .btn-download { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .btn-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .btn-view:hover, .btn-download:hover, .btn-delete:hover { transform: translateY(-2px); opacity: 0.85; }
        .messages-filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .search-input-wrapper { display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; padding: 8px 16px; flex: 1; max-width: 280px; }
        .search-input-wrapper svg { color: rgba(255, 255, 255, 0.4); font-size: 0.85rem; flex-shrink: 0; }
        .search-input-wrapper input { background: none; border: none; color: white; font-size: 0.85rem; width: 100%; outline: none; }
        .search-input-wrapper input:focus { outline: none; }
        .filter-group { display: flex; gap: 8px; }
        .filter-btn { padding: 6px 14px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; cursor: pointer; transition: all 0.3s ease; }
        .filter-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }
        .filter-btn.active { background: rgba(167, 139, 250, 0.15); border-color: rgba(167, 139, 250, 0.3); color: #a78bfa; }
        .messages-table-wrapper { overflow-x: auto; }
        .messages-table { width: 100%; border-collapse: collapse; }
        .messages-table th { text-align: left; padding: 12px; color: rgba(255, 255, 255, 0.5); font-weight: 500; font-size: 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
        .messages-table td { padding: 12px; color: rgba(255, 255, 255, 0.8); font-size: 0.8rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
        .unread-row { background: rgba(167, 139, 250, 0.03); }
        .sender-info { display: flex; flex-direction: column; }
        .sender-info strong { color: white; font-size: 0.85rem; }
        .sender-info span { font-size: 0.7rem; color: rgba(255, 255, 255, 0.5); }
        .status { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 500; }
        .status.read { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .status.unread { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .action-buttons { display: flex; gap: 6px; }
        .action-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border: none; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; }
        .action-icon.read { color: #10b981; }
        .action-icon.view { color: #38bdf8; }
        .action-icon.delete { color: #ef4444; }
        .action-icon:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.05); }
        .message-stats { display: flex; gap: 10px; }
        .stat-badge { padding: 4px 12px; background: rgba(255, 255, 255, 0.05); border-radius: 20px; font-size: 0.75rem; color: white; }
        .stat-badge.unread { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { max-width: 540px; width: 100%; max-height: 90vh; overflow-y: auto; background: #1a1a2e; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .modal-header h2 { font-size: 1.2rem; color: white; }
        .modal-close { background: none; border: none; color: rgba(255, 255, 255, 0.6); font-size: 1.2rem; cursor: pointer; padding: 4px; transition: color 0.3s; }
        .modal-close:hover { color: white; }
        .modal-close:disabled { opacity: 0.4; cursor: not-allowed; }
        .modal-body { padding: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; font-weight: 500; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; color: white; font-size: 0.85rem; box-sizing: border-box; transition: border-color 0.3s ease, background 0.3s ease; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #a78bfa; background: rgba(255, 255, 255, 0.08); }
        .form-group input:disabled, .form-group textarea:disabled { opacity: 0.5; cursor: not-allowed; }
        .form-group input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        /* Project Image Upload Styles */
        .project-image-upload-area {
          border-radius: 12px;
          transition: all 0.3s ease;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .image-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px;
          cursor: pointer;
          width: 100%;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .image-upload-label:hover {
          transform: translateY(-2px);
        }
        
        .upload-icon-wrapper {
          width: 64px;
          height: 64px;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        
        .upload-icon {
          font-size: 2rem;
          color: #a78bfa;
        }
        
        .upload-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .upload-text strong {
          color: white;
          font-size: 1rem;
        }
        
        .upload-text span {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
        }
        
        .upload-hint {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.7rem;
          margin-top: 8px;
        }
        
        .image-preview-container {
          width: 100%;
          padding: 20px;
        }
        
        .image-preview-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.3);
        }
        
        .image-preview {
          width: 100%;
          height: auto;
          max-height: 300px;
          object-fit: cover;
          display: block;
          border-radius: 12px;
        }
        
        .remove-image-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: rgba(239, 68, 68, 0.9);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10;
        }
        
        .remove-image-btn:hover {
          background: #ef4444;
          transform: scale(1.1);
        }
        
        .image-preview-actions {
          margin-top: 16px;
          text-align: center;
        }
        
        .change-image-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 40px;
          color: #a78bfa;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .change-image-btn:hover {
          background: rgba(139, 92, 246, 0.25);
          transform: translateY(-1px);
        }
        
        .certificates-file-upload { display: flex; flex-direction: column; gap: 8px; }
        .certificates-upload-label { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; cursor: pointer; width: fit-content; transition: all 0.3s; color: rgba(255, 255, 255, 0.8); }
        .certificates-upload-label:hover { background: rgba(255, 255, 255, 0.1); border-color: #a78bfa; }
        .certificates-image-preview { position: relative; width: 140px; margin-top: 8px; }
        .certificates-image-preview img { width: 100%; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); display: block; }
        .certificates-image-preview button { position: absolute; top: -10px; right: -10px; width: 26px; height: 26px; background: #ef4444; border: none; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
        .certificates-image-preview button:hover { transform: scale(1.1); }
        .certificates-upload-hint { font-size: 0.7rem; color: rgba(255, 255, 255, 0.4); }
        
        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin-top: 8px;
          position: relative;
        }
        .file-icon {
          font-size: 1.8rem;
        }
        .file-details {
          flex: 1;
        }
        .file-details strong {
          display: block;
          font-size: 0.85rem;
          color: white;
        }
        .file-details span {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }
        .remove-file {
          background: rgba(239, 68, 68, 0.2);
          border: none;
          color: #ef4444;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .remove-file:hover {
          background: #ef4444;
          color: white;
        }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 20px 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); flex-wrap: wrap; }
        .detail-item { margin-bottom: 16px; }
        .detail-item label { display: block; font-size: 0.7rem; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .detail-item p { color: white; font-size: 0.9rem; }
        .message-body { background: rgba(255, 255, 255, 0.02); padding: 12px; border-radius: 10px; color: rgba(255, 255, 255, 0.8); line-height: 1.5; white-space: pre-wrap; font-size: 0.85rem; }
        .message-detail-modal { max-width: 600px; }
        .spinner-icon { animation: spin 1s linear infinite; margin-right: 6px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-loading { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: #07070e; color: rgba(255,255,255,0.6); }
        .admin-loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: #a78bfa; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @media (max-width: 768px) {
          .container { padding: 0 16px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-tab { padding: 6px 14px; font-size: 0.75rem; }
          .cv-preview { flex-direction: column; text-align: center; }
          .cv-actions { justify-content: center; }
          .form-row { grid-template-columns: 1fr; }
          .messages-filters { flex-direction: column; align-items: stretch; }
          .search-input-wrapper { max-width: 100%; }
          .messages-table th, .messages-table td { padding: 8px; font-size: 0.7rem; }
          .modal { width: 95%; }
          .project-image-upload-area { min-height: 180px; }
          .image-upload-label { padding: 20px; }
          .upload-icon-wrapper { width: 48px; height: 48px; }
          .upload-icon { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;