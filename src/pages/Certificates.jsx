// src/pages/Certificates.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { certificatesAPI } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import Button from "../styles/components/ui/Button.jsx";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCertificate,
  FaUpload,
  FaTimes,
  FaSpinner,
  FaCalendarAlt,
  FaIdCard,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaEye,
  FaDownload,
  FaExternalLinkAlt,
  FaImage,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { supabase } from "../services/supabase";

const Certificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issue_date: "",
    credential_id: "",
    image_url: "",
    thumbnail_url: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadThumbnail, setUploadThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // State untuk PDF Preview Modal
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState("");

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [searchTerm, certificates]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificatesAPI.getAll();
      setCertificates(data);
      setFilteredCertificates(data);
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    if (!searchTerm) {
      setFilteredCertificates(certificates);
    } else {
      const filtered = certificates.filter(
        (cert) =>
          cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCertificates(filtered);
    }
    setCurrentPage(1);
  };

  const extractStoragePath = (url) => {
    if (!url) return null;
    const marker = "/storage/v1/object/public/certificates/";
    const idx = url.indexOf(marker);
    if (idx !== -1) return url.substring(idx + marker.length);
    const parts = url.split("certificates/");
    return parts.length > 1 ? parts[parts.length - 1] : null;
  };

  // Upload file utama ke storage
  const uploadFileToStorage = async (file) => {
    if (!file) return null;
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB");
    }
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `certificates/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload file");
    }
    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  // Upload thumbnail ke storage
  const uploadThumbnailToStorage = async (file) => {
    if (!file) return null;
    if (!file.type.startsWith('image/')) {
      throw new Error("Thumbnail must be an image file");
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Thumbnail size must be less than 2MB");
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
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload thumbnail");
    }
    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.issue_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);
      let fileUrl = formData.image_url;
      let thumbnailUrl = formData.thumbnail_url;

      if (uploadFile) {
        toast.loading("Uploading file...", { id: "upload" });
        fileUrl = await uploadFileToStorage(uploadFile);
        toast.success("File uploaded successfully!", { id: "upload" });
      }
      
      if (uploadThumbnail) {
        toast.loading("Uploading thumbnail...", { id: "thumb" });
        thumbnailUrl = await uploadThumbnailToStorage(uploadThumbnail);
        toast.success("Thumbnail uploaded successfully!", { id: "thumb" });
      }

      const payload = {
        title: formData.title,
        description: formData.description || "",
        issue_date: formData.issue_date,
        credential_id: formData.credential_id || "",
        image_url: fileUrl || "",
        thumbnail_url: thumbnailUrl || "",
      };

      if (editingCertificate) {
        await certificatesAPI.update(editingCertificate.id, payload);
        toast.success("Certificate updated successfully");
      } else {
        await certificatesAPI.create({ ...payload, user_id: user?.id });
        toast.success("Certificate added successfully");
      }

      closeModal();
      await loadCertificates();
    } catch (error) {
      console.error("Error saving certificate:", error);
      toast.error(error.message || "Failed to save certificate");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      try {
        const certToDelete = certificates.find((c) => c.id === id);
        if (certToDelete?.image_url) {
          const storagePath = extractStoragePath(certToDelete.image_url);
          if (storagePath) {
            await supabase.storage
              .from("certificates")
              .remove([storagePath])
              .catch((err) => console.error("Error deleting file:", err));
          }
        }
        if (certToDelete?.thumbnail_url) {
          const thumbPath = extractStoragePath(certToDelete.thumbnail_url);
          if (thumbPath) {
            await supabase.storage
              .from("certificates")
              .remove([thumbPath])
              .catch((err) => console.error("Error deleting thumbnail:", err));
          }
        }
        await certificatesAPI.delete(id);
        toast.success("Certificate deleted successfully");
        await loadCertificates();
      } catch (error) {
        console.error("Error deleting certificate:", error);
        toast.error("Failed to delete certificate");
      }
    }
  };

  const handleEdit = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      title: certificate.title || "",
      description: certificate.description || "",
      issue_date: certificate.issue_date || "",
      credential_id: certificate.credential_id || "",
      image_url: certificate.image_url || "",
      thumbnail_url: certificate.thumbnail_url || "",
    });
    setThumbnailPreview(certificate.thumbnail_url || null);
    setUploadFile(null);
    setUploadThumbnail(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setUploadFile(selectedFile);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const handleThumbnailChange = (e) => {
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
    setUploadThumbnail(selectedFile);
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(URL.createObjectURL(selectedFile));
    setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
  };

  const removeThumbnail = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setUploadThumbnail(null);
    setThumbnailPreview(null);
    setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
  };

  const removeFile = () => {
    setUploadFile(null);
  };

  const closeModal = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setIsModalOpen(false);
    setEditingCertificate(null);
    setFormData({
      title: "",
      description: "",
      issue_date: "",
      credential_id: "",
      image_url: "",
      thumbnail_url: "",
    });
    setUploadFile(null);
    setUploadThumbnail(null);
    setThumbnailPreview(null);
  };

  const openPdfPreview = (pdfUrl, title) => {
    setSelectedPdfUrl(pdfUrl);
    setSelectedPdfTitle(title);
    setShowPdfModal(true);
  };

  const getFileDisplay = (fileUrl) => {
    if (!fileUrl) return { icon: <FaCertificate />, type: "empty", label: "No File" };
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return { icon: null, type: "image", label: "Image" };
    if (fileUrl.match(/\.pdf$/i)) return { icon: <FaFilePdf />, type: "pdf", label: "PDF Document" };
    if (fileUrl.match(/\.docx?$/i)) return { icon: <FaFileWord />, type: "word", label: "Word Document" };
    return { icon: <FaFileAlt />, type: "file", label: "File" };
  };

  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

  if (loading) {
    return (
      <div className="certificates-page">
        <div className="container">
          <div className="certificates-header">
            <h1 className="certificates-title gradient-text">Certificates</h1>
            <p className="certificates-subtitle">Loading certificates...</p>
          </div>
          <div className="certificates-grid skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      <div className="container">
        <div className="certificates-header">
          <h1 className="certificates-title gradient-text">Certificates</h1>
          <p className="certificates-subtitle">
            My professional certifications and achievements
          </p>
        </div>

        <div className="certificates-toolbar">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          {user && (
            <Button onClick={() => setIsModalOpen(true)}>
              <FaPlus /> Add Certificate
            </Button>
          )}
        </div>

        {paginatedCertificates.length === 0 ? (
          <div className="certificates-empty">
            <FaCertificate className="certificates-empty-icon" />
            <h3>No Certificates Found</h3>
            <p>
              {searchTerm
                ? "No certificates match your search criteria"
                : "Start adding your professional certificates"}
            </p>
            {user && !searchTerm && (
              <Button onClick={() => setIsModalOpen(true)}>
                <FaPlus /> Add Your First Certificate
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="certificates-grid">
              {paginatedCertificates.map((certificate) => {
                const fileDisplay = getFileDisplay(certificate.image_url);
                const isPdf = fileDisplay.type === "pdf";
                const hasThumbnail = certificate.thumbnail_url;
                const isImage = certificate.image_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                
                return (
                  <div key={certificate.id} className="certificate-card">
                    <div className="certificate-link">
                      <div className="certificate-image-wrapper">
                        {/* PRIORITAS: Thumbnail > Gambar utama > Icon PDF */}
                        {hasThumbnail ? (
                          <div 
                            className="certificate-thumbnail"
                            onClick={() => isPdf ? openPdfPreview(certificate.image_url, certificate.title) : null}
                          >
                            <img
                              src={certificate.thumbnail_url}
                              alt={certificate.title}
                              className="certificate-image"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/400x300/1a1a2e/ffffff?text=No+Image";
                              }}
                            />
                          </div>
                        ) : isImage ? (
                          <Link to={`/certificates/${certificate.id}`}>
                            <img
                              src={certificate.image_url}
                              alt={certificate.title}
                              className="certificate-image"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/400x300/1a1a2e/ffffff?text=No+Image";
                              }}
                            />
                          </Link>
                        ) : isPdf ? (
                          <div 
                            className="certificate-file-preview pdf"
                            onClick={() => openPdfPreview(certificate.image_url, certificate.title)}
                          >
                            <div className="file-icon-large">
                              <FaFilePdf size={48} />
                            </div>
                            <div className="file-info-content">
                              <span className="certificate-title-display">
                                {certificate.title.length > 35 ? certificate.title.substring(0, 32) + "..." : certificate.title}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <Link to={`/certificates/${certificate.id}`}>
                            <div className="certificate-file-preview">
                              <div className="file-icon-large">
                                {fileDisplay.icon}
                              </div>
                              <div className="file-info-content">
                                <span className="certificate-title-display">
                                  {certificate.title.length > 35 ? certificate.title.substring(0, 32) + "..." : certificate.title}
                                </span>
                              </div>
                            </div>
                          </Link>
                        )}
                        
                        <div className="certificate-overlay">
                          {isPdf ? (
                            <button 
                              onClick={() => openPdfPreview(certificate.image_url, certificate.title)}
                              className="view-details"
                            >
                              <FaEye /> Preview PDF
                            </button>
                          ) : (
                            <Link to={`/certificates/${certificate.id}`} className="view-details">
                              View Details
                            </Link>
                          )}
                        </div>
                        
                        {user && (
                          <div
                            className="certificate-actions"
                            onClick={(e) => e.preventDefault()}
                          >
                            <button
                              onClick={() => handleEdit(certificate)}
                              className="action-btn edit"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(certificate.id)}
                              className="action-btn delete"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="certificate-content">
                        <h3>{certificate.title}</h3>
                        {certificate.description && (
                          <p>{certificate.description.substring(0, 80)}...</p>
                        )}
                        <div className="certificate-footer">
                          <div className="certificate-date">
                            <FaCalendarAlt />
                            <span>
                              {new Date(certificate.issue_date).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {certificate.credential_id && (
                            <div className="certificate-credential">
                              <FaIdCard />
                              <span>{certificate.credential_id.substring(0, 15)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="certificates-pagination">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPdfModal && selectedPdfUrl && (
        <div className="pdf-modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>
                <FaFilePdf className="pdf-icon-header" />
                {selectedPdfTitle}
              </h3>
              <button className="pdf-modal-close" onClick={() => setShowPdfModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="pdf-modal-body">
              <iframe
                src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(selectedPdfUrl)}`}
                title={selectedPdfTitle}
                className="pdf-iframe"
                frameBorder="0"
              />
            </div>
            <div className="pdf-modal-footer">
              <a
                href={selectedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pdf-btn pdf-btn-primary"
              >
                <FaExternalLinkAlt /> Open Full PDF
              </a>
              <a
                href={selectedPdfUrl}
                download
                className="pdf-btn pdf-btn-secondary"
              >
                <FaDownload /> Download PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Certificate - Dengan Thumbnail Upload */}
      {isModalOpen && (
        <div
          className="certificates-modal-overlay"
          onClick={() => !uploading && closeModal()}
        >
          <div
            className="certificates-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="certificates-modal-header">
              <h2>
                {editingCertificate ? "Edit Certificate" : "Add Certificate"}
              </h2>
              <button
                className="certificates-modal-close"
                onClick={closeModal}
                disabled={uploading}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="certificates-form-body">
                {/* Title */}
                <div className="certificates-form-group">
                  <label>
                    Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AWS Certified Solutions Architect"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    disabled={uploading}
                  />
                </div>

                {/* Description */}
                <div className="certificates-form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Brief description of this certificate..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    disabled={uploading}
                    style={{ resize: "vertical" }}
                  />
                </div>

                {/* Issue Date & Credential ID */}
                <div className="certificates-form-row">
                  <div className="certificates-form-group">
                    <label>
                      Issue Date <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          issue_date: e.target.value,
                        })
                      }
                      required
                      disabled={uploading}
                    />
                  </div>
                  <div className="certificates-form-group">
                    <label>Credential ID</label>
                    <input
                      type="text"
                      placeholder="e.g. ABC-12345"
                      value={formData.credential_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          credential_id: e.target.value,
                        })
                      }
                      disabled={uploading}
                    />
                  </div>
                </div>

                {/* Thumbnail Upload - Untuk tampilan card */}
                <div className="certificates-form-group">
                  <label>Thumbnail Image (For Card Display)</label>
                  <div className="certificates-file-upload">
                    <label
                      className="certificates-upload-label"
                      style={uploading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                    >
                      <FaImage style={{ fontSize: "0.8rem" }} />
                      <span style={{ fontSize: "0.85rem" }}>
                        {uploadThumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        style={{ display: "none" }}
                        disabled={uploading}
                      />
                    </label>
                    <span className="certificates-upload-hint">
                      JPG, PNG, GIF, WEBP — max 2MB (Recommended: 400x300)
                    </span>

                    {thumbnailPreview && (
                      <div className="certificates-image-preview">
                        <img src={thumbnailPreview} alt="Thumbnail Preview" />
                        {!uploading && (
                          <button
                            type="button"
                            onClick={removeThumbnail}
                            title="Remove thumbnail"
                          >
                            <FaTimes style={{ fontSize: "0.6rem" }} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload - PDF/Document */}
                <div className="certificates-form-group">
                  <label>Certificate File (PDF, Word, etc.)</label>
                  <div className="certificates-file-upload">
                    <label
                      className="certificates-upload-label"
                      style={uploading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
                    >
                      <FaUpload style={{ fontSize: "0.8rem" }} />
                      <span style={{ fontSize: "0.85rem" }}>
                        {uploadFile ? "Change File" : "Upload File"}
                      </span>
                      <input
                        type="file"
                        accept="*/*"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        disabled={uploading}
                      />
                    </label>
                    <span className="certificates-upload-hint">
                      Any file type accepted (PDF, DOC, etc.) — Max 10MB
                    </span>

                    {uploadFile && (
                      <div className="file-info">
                        <div className="file-icon">
                          {uploadFile.type.includes('pdf') ? <FaFilePdf size={24} /> : 
                           uploadFile.type.includes('word') ? <FaFileWord size={24} /> : '📎'}
                        </div>
                        <div className="file-details">
                          <strong>{uploadFile.name}</strong>
                          <span>{(uploadFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                        {!uploading && (
                          <button type="button" onClick={removeFile} className="remove-file">×</button>
                        )}
                      </div>
                    )}

                    {formData.image_url && !uploadFile && (
                      <div className="file-info">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                          <strong>Current file</strong>
                          <span>{formData.image_url.split('/').pop()?.substring(0, 40)}...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="certificates-modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <FaSpinner className="certificates-spinner-icon" />
                      {uploadFile || uploadThumbnail ? "Uploading..." : "Saving..."}
                    </>
                  ) : editingCertificate ? (
                    "Update Certificate"
                  ) : (
                    "Add Certificate"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .certificates-page {
          min-height: 100vh;
          padding: 100px 0 60px;
          background: #07070e;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .certificates-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .certificates-title {
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

        .certificates-subtitle {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .certificates-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 320px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 40px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #a78bfa;
          background: rgba(255, 255, 255, 0.08);
        }

        .certificates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 28px;
        }

        .certificate-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          cursor: pointer;
          position: relative;
        }

        .certificate-card:hover {
          transform: translateY(-8px);
          border-color: rgba(167, 139, 250, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .certificate-link {
          color: inherit;
          text-decoration: none;
          display: block;
        }

        .certificate-image-wrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .certificate-thumbnail {
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        .certificate-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .certificate-card:hover .certificate-image {
          transform: scale(1.08);
        }

        .certificate-file-preview {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e, #0f0f1a);
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .certificate-file-preview.pdf {
          background: linear-gradient(135deg, #2a1a2e, #1f0f2a);
        }

        .file-icon-large {
          font-size: 4rem;
          margin-bottom: 12px;
        }

        .certificate-file-preview.pdf .file-icon-large {
          color: #ef4444;
        }

        .file-info-content {
          text-align: center;
          padding: 0 12px;
        }

        .certificate-title-display {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
          margin-top: 4px;
          line-height: 1.3;
        }

        .certificate-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(79, 70, 229, 0.9));
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .certificate-card:hover .certificate-overlay {
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
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          border: none;
        }

        .certificate-card:hover .view-details {
          transform: translateY(0);
        }

        .certificate-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
        }

        .certificate-card:hover .certificate-actions {
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

        .action-btn:hover {
          transform: scale(1.1);
          background: rgba(0, 0, 0, 0.9);
        }

        .action-btn.edit { color: #fbbf24; }
        .action-btn.delete { color: #ef4444; }

        .certificate-content {
          padding: 20px;
        }

        .certificate-content h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: white;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .certificate-content p {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 12px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .certificate-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .certificate-date, .certificate-credential {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .certificate-date svg, .certificate-credential svg {
          font-size: 0.65rem;
          color: #a78bfa;
        }

        .certificates-empty {
          text-align: center;
          padding: 80px 20px;
        }

        .certificates-empty-icon {
          font-size: 5rem;
          color: rgba(255, 255, 255, 0.05);
          margin-bottom: 20px;
        }

        .certificates-empty h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
          color: white;
        }

        .certificates-empty p {
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 28px;
        }

        .certificates-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 48px;
        }

        .certificates-pagination span {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        /* PDF Modal Styles */
        .pdf-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .pdf-modal {
          max-width: 1000px;
          width: 90%;
          max-height: 90vh;
          background: #1a1a2e;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .pdf-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pdf-modal-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .pdf-icon-header {
          color: #ef4444;
        }

        .pdf-modal-close {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .pdf-modal-close:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .pdf-modal-body {
          flex: 1;
          padding: 20px;
          min-height: 500px;
        }

        .pdf-iframe {
          width: 100%;
          height: 600px;
          border: none;
          border-radius: 12px;
        }

        .pdf-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }

        .pdf-btn-primary {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
        }

        .pdf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
        }

        .pdf-btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .pdf-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .certificates-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .certificates-modal {
          max-width: 580px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          background: #1a1a2e;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .certificates-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .certificates-modal-header h2 {
          font-size: 1.3rem;
          color: white;
        }

        .certificates-modal-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s ease;
        }

        .certificates-modal-close:hover {
          color: white;
        }

        .certificates-form-body {
          padding: 24px;
        }

        .certificates-form-group {
          margin-bottom: 20px;
        }

        .certificates-form-group label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .certificates-form-group input,
        .certificates-form-group textarea {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 0.9rem;
          box-sizing: border-box;
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .certificates-form-group input:focus,
        .certificates-form-group textarea:focus {
          outline: none;
          border-color: #a78bfa;
          background: rgba(255, 255, 255, 0.08);
        }

        .certificates-form-group input:disabled,
        .certificates-form-group textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .certificates-form-group input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }

        .certificates-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .certificates-file-upload {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .certificates-upload-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 40px;
          cursor: pointer;
          width: fit-content;
          transition: all 0.3s;
          color: rgba(255, 255, 255, 0.8);
        }

        .certificates-upload-label:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #a78bfa;
        }

        .certificates-image-preview {
          position: relative;
          width: 140px;
          margin-top: 8px;
        }

        .certificates-image-preview img {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: block;
        }

        .certificates-image-preview button {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 26px;
          height: 26px;
          background: #ef4444;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .certificates-image-preview button:hover {
          transform: scale(1.1);
        }

        .certificates-upload-hint {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

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
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
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

        .certificates-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .certificates-spinner-icon {
          animation: spin 1s linear infinite;
          margin-right: 6px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

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

        .skeleton-text.short {
          width: 40%;
          height: 16px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .container { padding: 0 16px; }
          .certificates-toolbar { flex-direction: column; }
          .search-container { max-width: 100%; }
          .certificates-grid { gap: 20px; }
          .certificates-form-row { grid-template-columns: 1fr; }
          .certificates-modal { width: 95%; }
          .file-icon-large { font-size: 2.5rem; }
          .certificate-title-display { font-size: 0.7rem; }
          .pdf-modal { width: 95%; }
          .pdf-iframe { height: 400px; }
          .pdf-modal-body { min-height: auto; }
        }
      `}</style>
    </div>
  );
};

export default Certificates;