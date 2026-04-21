// src/pages/CV.jsx
import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaEye,
  FaUpload,
  FaTrash,
  FaFilePdf,
  FaFileWord,
  FaCheckCircle,
  FaTimes,
  FaExpand,
} from "react-icons/fa";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth";

const CV = () => {
  const { user } = useAuth();
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    loadCV();
  }, []);

  const loadCV = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: cvData, error: cvError } = await supabase
        .from("cv_files")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cvError) {
        console.error("Error loading CV:", cvError);
      }

      if (cvData) {
        setFileInfo(cvData);
        setFileType(cvData.file_type);

        const { data: publicUrlData } = supabase.storage
          .from("cv-files")
          .getPublicUrl(cvData.file_path);

        setCvUrl(publicUrlData.publicUrl);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while loading CV");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload PDF or Word document (DOC/DOCX) only.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setCvFile(file);
    setFileType(file.type);

    const previewUrl = URL.createObjectURL(file);
    setCvUrl(previewUrl);
  };

  const handleUpload = async () => {
    if (!cvFile) return;
    if (!user) {
      alert("Please login to upload CV");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const fileExt = cvFile.name.split(".").pop();
      const fileName = `cv_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cv-files")
        .upload(filePath, cvFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("cv-files")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("cv_files").insert([
        {
          user_id: user.id,
          file_name: cvFile.name,
          file_path: filePath,
          file_size: cvFile.size,
          file_type: cvFile.type,
          public_url: publicUrlData.publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      setCvUrl(publicUrlData.publicUrl);
      setUploadSuccess(true);
      setFileInfo({
        file_name: cvFile.name,
        file_type: cvFile.type,
        file_size: cvFile.size,
      });

      setTimeout(() => setUploadSuccess(false), 3000);

      setCvFile(null);
      const fileInput = document.getElementById("cv-file-input");
      if (fileInput) fileInput.value = "";

      await loadCV();
    } catch (error) {
      console.error("Error uploading:", error);
      setError("Failed to upload CV. Please try again.");
      alert("Failed to upload CV. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete this CV?")) return;

    try {
      setLoading(true);
      setError(null);

      const { data: cvData, error: fetchError } = await supabase
        .from("cv_files")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (cvData) {
        const { error: storageError } = await supabase.storage
          .from("cv-files")
          .remove([cvData.file_path]);

        if (storageError) throw storageError;

        const { error: dbError } = await supabase
          .from("cv_files")
          .delete()
          .eq("id", cvData.id);

        if (dbError) throw dbError;
      }

      setCvUrl(null);
      setFileInfo(null);
      setFileType(null);

      alert("CV deleted successfully!");
      await loadCV();
    } catch (error) {
      console.error("Error deleting:", error);
      setError("Failed to delete CV. Please try again.");
      alert("Failed to delete CV. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (cvUrl) {
      const link = document.createElement("a");
      link.href = cvUrl;
      link.download = fileInfo?.file_name || "cv_document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getGoogleDocsViewerUrl = (url) => {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
  };

  const getOfficeViewerUrl = (url) => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  };

  const getFileIcon = () => {
    if (fileType?.includes("pdf"))
      return <FaFilePdf style={{ color: "#ef4444" }} />;
    if (fileType?.includes("word") || fileType?.includes("document"))
      return <FaFileWord style={{ color: "#3b82f6" }} />;
    return <FaFilePdf />;
  };

  const getFileTypeLabel = () => {
    if (fileType?.includes("pdf")) return "PDF Document";
    if (fileType?.includes("word")) return "Word Document";
    if (fileType?.includes("document")) return "Word Document";
    return "Document";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const isWordFile = () => {
    return (
      fileType?.includes("word") ||
      fileType?.includes("document") ||
      fileInfo?.file_name?.match(/\.(doc|docx)$/i)
    );
  };

  const isPdfFile = () => {
    return fileType?.includes("pdf") || fileInfo?.file_name?.match(/\.pdf$/i);
  };

  // Skeleton Loading
  if (loading) {
    return (
      <div className="cv-page">
        <div className="container">
          <div className="certificates-header">
            <h1 className="certificates-title gradient-text">CV</h1>
            <p className="certificates-subtitle">Loading CV...</p>
          </div>
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
        <style>{`
          .skeleton-card {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 20px;
            overflow: hidden;
            animation: pulse 1.5s ease-in-out infinite;
          }
          .skeleton-image {
            height: 400px;
            background: rgba(255, 255, 255, 0.05);
          }
          .skeleton-title {
            height: 30px;
            margin: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
          }
          .skeleton-text {
            height: 100px;
            margin: 0 20px 20px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
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
    <div className="cv-page">
      <div className="container">
        <div className="certificates-header">
          <h1 className="certificates-title gradient-text">CV</h1>
          <p className="certificates-subtitle">
            Download or view my professional resume
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="cv-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Upload Section - Only for admin */}
        {user && (
          <div className="cv-upload-section glass">
            <h3>Upload New CV</h3>
            <div className="cv-upload-area">
              <input
                type="file"
                id="cv-file-input"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <label htmlFor="cv-file-input" className="cv-upload-label">
                <FaUpload />
                <span>Click to upload PDF or Word file</span>
                <small>Max file size: 10MB</small>
              </label>

              {cvFile && (
                <div className="cv-file-preview">
                  <span>
                    {getFileIcon()} {cvFile.name}
                  </span>
                  <span className="file-size">
                    ({formatFileSize(cvFile.size)})
                  </span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!cvFile || uploading}
                className="btn btn-primary"
              >
                {uploading ? "Uploading..." : "Upload CV"}
              </button>

              {uploadSuccess && (
                <div className="upload-success">
                  <FaCheckCircle /> CV uploaded successfully!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="cv-actions">
          {cvUrl && !loading && (
            <>
              <button onClick={handleDownload} className="btn btn--primary">
                <FaDownload className="btn-icon" /> Download CV
              </button>
              <button
                onClick={() => setFullscreen(true)}
                className="btn btn--secondary"
              >
                <FaExpand className="btn-icon" /> Fullscreen View
              </button>
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--secondary"
              >
                <FaEye className="btn-icon" /> Open in New Tab
              </a>
            </>
          )}
          {user && cvUrl && !loading && (
            <button onClick={handleDelete} className="btn btn--danger">
              <FaTrash className="btn-icon" /> Delete CV
            </button>
          )}
        </div>

        {/* CV Preview */}
        <div className="cv-preview-card glass">
          {cvUrl ? (
            <>
              <div className="cv-preview-header">
                <div className="cv-info">
                  {getFileIcon()}
                  <span className="cv-name">
                    {fileInfo?.file_name || "CV Document"}
                  </span>
                  <span className="cv-type">{getFileTypeLabel()}</span>
                  {fileInfo?.file_size && (
                    <span className="cv-size">
                      ({formatFileSize(fileInfo.file_size)})
                    </span>
                  )}
                </div>
              </div>
              <div className="cv-preview-body">
                {/* PDF Preview */}
                {isPdfFile() && (
                  <embed
                    src={`${cvUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    className="cv-embed"
                  />
                )}

                {/* Word Document Preview using Google Docs Viewer */}
                {isWordFile() && (
                  <div className="word-preview-container">
                    <div className="word-preview-toolbar">
                      <span className="preview-info">
                        <FaFileWord /> Preview via Google Docs Viewer
                      </span>
                      <a
                        href={getGoogleDocsViewerUrl(cvUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-link"
                      >
                        Open in Google Docs
                      </a>
                    </div>
                    <iframe
                      src={getGoogleDocsViewerUrl(cvUrl)}
                      className="word-iframe"
                      title="Word Document Preview"
                      frameBorder="0"
                    />
                    <div className="word-preview-fallback">
                      <p>Having trouble viewing? Try these options:</p>
                      <div className="fallback-buttons">
                        <button
                          onClick={handleDownload}
                          className="btn-small btn-primary"
                        >
                          <FaDownload /> Download File
                        </button>
                        <a
                          href={getOfficeViewerUrl(cvUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-small btn-secondary"
                        >
                          <FaEye /> Open in Office Online
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="cv-empty">
              <FaFilePdf className="empty-icon" />
              <h3>No CV Available</h3>
              <p>
                {user
                  ? "Please upload your CV using the form above."
                  : "CV will be available soon. Please check back later."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && cvUrl && (
        <div className="fullscreen-modal" onClick={() => setFullscreen(false)}>
          <div
            className="fullscreen-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fullscreen-header">
              <h3>{fileInfo?.file_name || "CV Document"}</h3>
              <button
                onClick={() => setFullscreen(false)}
                className="fullscreen-close"
              >
                <FaTimes />
              </button>
            </div>
            {isPdfFile() ? (
              <embed
                src={`${cvUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                type="application/pdf"
                className="fullscreen-embed"
              />
            ) : (
              <iframe
                src={getGoogleDocsViewerUrl(cvUrl)}
                className="fullscreen-embed"
                title="Word Document Fullscreen"
                frameBorder="0"
              />
            )}
          </div>
        </div>
      )}

      <style>{`
        .cv-page {
          min-height: 100vh;
          padding: 100px 0 60px;
          background: var(--bg-primary, #07070e);
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Header - Sama dengan Certificates */
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

        /* Error */
        .cv-error {
          max-width: 600px;
          margin: 0 auto 20px;
          padding: 12px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          text-align: center;
        }

        /* Glass effect */
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Upload Section */
        .cv-upload-section {
          max-width: 600px;
          margin: 0 auto 32px;
          padding: 32px;
          border-radius: 20px;
        }

        .cv-upload-section h3 {
          margin-bottom: 20px;
          color: white;
          text-align: center;
        }

        .cv-upload-area {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cv-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px;
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
        }

        .cv-upload-label:hover {
          border-color: #a78bfa;
          background: rgba(167, 139, 250, 0.05);
        }

        .cv-upload-label svg {
          font-size: 2rem;
          color: #a78bfa;
        }

        .cv-upload-label span {
          color: white;
          font-weight: 500;
        }

        .cv-upload-label small {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
        }

        .cv-file-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          color: white;
        }

        .file-size {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .upload-success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          color: #22c55e;
        }

        /* Buttons */
        .cv-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 32px;
          flex-wrap: wrap;
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
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%);
          color: white;
        }

        .btn--secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn--danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-icon {
          font-size: 0.9rem;
        }

        .btn-small {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Preview Card */
        .cv-preview-card {
          border-radius: 20px;
          overflow: hidden;
        }

        .cv-preview-header {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.2);
        }

        .cv-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          color: white;
        }

        .cv-info svg {
          font-size: 1.2rem;
        }

        .cv-name {
          font-weight: 500;
        }

        .cv-type {
          padding: 2px 8px;
          background: rgba(167, 139, 250, 0.15);
          border-radius: 4px;
          font-size: 0.7rem;
          color: #a78bfa;
        }

        .cv-size {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .cv-preview-body {
          min-height: 600px;
        }

        /* PDF Embed */
        .cv-embed {
          width: 100%;
          height: 70vh;
          min-height: 600px;
        }

        /* Word Preview */
        .word-preview-container {
          display: flex;
          flex-direction: column;
          height: 70vh;
          min-height: 600px;
        }

        .word-preview-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 12px;
        }

        .preview-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .preview-link {
          color: #a78bfa;
          text-decoration: none;
          font-size: 0.85rem;
          padding: 4px 12px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .preview-link:hover {
          background: rgba(167, 139, 250, 0.1);
        }

        .word-iframe {
          flex: 1;
          width: 100%;
          border: none;
        }

        .word-preview-fallback {
          padding: 20px;
          text-align: center;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .word-preview-fallback p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 12px;
          font-size: 0.85rem;
        }

        .fallback-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Empty State */
        .cv-empty {
          text-align: center;
          padding: 80px 40px;
        }

        .empty-icon {
          font-size: 5rem;
          color: rgba(255, 255, 255, 0.1);
          margin-bottom: 20px;
        }

        .cv-empty h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
          color: white;
        }

        .cv-empty p {
          color: rgba(255, 255, 255, 0.5);
        }

        /* Fullscreen Modal */
        .fullscreen-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .fullscreen-content {
          width: 95%;
          height: 95%;
          background: #1a1a2e;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .fullscreen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #1a1a2e;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .fullscreen-header h3 {
          color: white;
          font-size: 1rem;
          margin: 0;
        }

        .fullscreen-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .fullscreen-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .fullscreen-embed {
          flex: 1;
          width: 100%;
          border: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }

          .cv-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .cv-actions .btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }

          .cv-embed, .word-preview-container {
            height: 50vh;
            min-height: 400px;
          }

          .cv-preview-body {
            min-height: 400px;
          }

          .word-preview-toolbar {
            flex-direction: column;
            text-align: center;
          }

          .fallback-buttons {
            flex-direction: column;
            align-items: center;
          }

          .fallback-buttons .btn-small {
            width: 100%;
            max-width: 200px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CV;