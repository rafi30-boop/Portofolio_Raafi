// src/pages/CertificateDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { certificatesAPI } from "../services/api.js";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaIdCard, 
  FaExternalLinkAlt, 
  FaDownload, 
  FaShare,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaImage,
  FaEye
} from "react-icons/fa";
import Button from "../styles/components/ui/Button.jsx";
import toast from "react-hot-toast";

const CertificateDetail = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    loadCertificate();
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const data = await certificatesAPI.getById(id);
      setCertificate(data);
    } catch (error) {
      console.error("Error loading certificate:", error);
      toast.error("Failed to load certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: certificate.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const isImage = (url) => {
    return url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const isPDF = (url) => {
    return url?.match(/\.pdf$/i);
  };

  const isWord = (url) => {
    return url?.match(/\.docx?$/i);
  };

  const getFileIcon = (url) => {
    if (!url) return <FaFileAlt size={48} />;
    if (isPDF(url)) return <FaFilePdf size={48} />;
    if (isWord(url)) return <FaFileWord size={48} />;
    if (isImage(url)) return <FaImage size={48} />;
    return <FaFileAlt size={48} />;
  };

  const getFileTypeLabel = (url) => {
    if (!url) return "No File";
    if (isPDF(url)) return "PDF Document";
    if (isWord(url)) return "Word Document";
    if (isImage(url)) return "Image";
    return "File";
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Loading certificate details...</p>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="detail-notfound">
        <div className="notfound-icon">📜</div>
        <h2>Certificate not found</h2>
        <p>The certificate you're looking for doesn't exist or has been removed.</p>
        <Link to="/certificates">
          <Button>Back to Certificates</Button>
        </Link>
      </div>
    );
  }

  const fileIsImage = isImage(certificate.image_url);
  const fileIsPDF = isPDF(certificate.image_url);

  return (
    <div className="certificate-detail-page">
      <div className="container">
        <Link to="/certificates" className="back-link">
          <FaArrowLeft /> Back to Certificates
        </Link>

        <div className="certificate-detail-content">
          <div className="detail-image-section">
            <div className={`image-container ${imageLoaded ? "loaded" : ""}`}>
              {fileIsImage ? (
                // Tampilkan Gambar
                <img
                  src={certificate.image_url || "https://dummyimage.com/600x400/1a1a2e/ffffff&text=Certificate"}
                  alt={certificate.title}
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => {
                    e.target.src = "https://dummyimage.com/600x400/1a1a2e/ffffff&text=Certificate";
                    setImageLoaded(true);
                  }}
                />
              ) : fileIsPDF ? (
                // Tampilkan PDF Viewer dengan Google Docs
                <div className="pdf-viewer-wrapper">
                  <div className="pdf-toolbar">
                    <span className="pdf-label">
                      <FaFilePdf /> PDF Document
                    </span>
                    <div className="pdf-toolbar-actions">
                      <a 
                        href={certificate.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="pdf-toolbar-btn"
                        title="Open in new tab"
                      >
                        <FaExternalLinkAlt />
                      </a>
                      <a 
                        href={certificate.image_url} 
                        download
                        className="pdf-toolbar-btn"
                        title="Download PDF"
                      >
                        <FaDownload />
                      </a>
                    </div>
                  </div>
                  <iframe
                    src={`https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(certificate.image_url)}`}
                    title={certificate.title}
                    className="pdf-iframe"
                    frameBorder="0"
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="pdf-footer">
                    <p>Having trouble viewing? <a href={certificate.image_url} target="_blank" rel="noopener noreferrer">Open PDF directly</a></p>
                  </div>
                </div>
              ) : certificate.image_url ? (
                // Tampilkan preview untuk file lain (Word, Excel, dll)
                <div className="file-preview">
                  <div className="file-icon-large">
                    {getFileIcon(certificate.image_url)}
                  </div>
                  <div className="file-info-detail">
                    <h4>{getFileTypeLabel(certificate.image_url)}</h4>
                    <p>{certificate.image_url?.split('/').pop() || "No file attached"}</p>
                    <div className="file-buttons">
                      <a 
                        href={certificate.image_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-file-btn"
                      >
                        <FaExternalLinkAlt /> Open File
                      </a>
                      <a 
                        href={certificate.image_url} 
                        download
                        className="view-file-btn secondary"
                      >
                        <FaDownload /> Download
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                // No file
                <div className="no-file">
                  <FaFileAlt size={64} />
                  <p>No file attached</p>
                </div>
              )}
              <div className="image-shimmer"></div>
            </div>
          </div>

          <div className="detail-info-section">
            <div className="certificate-badge">
              <span>Verified Certificate</span>
            </div>
            
            <h1 className="detail-title">{certificate.title}</h1>

            {certificate.description && (
              <div className="detail-description">
                <p>{certificate.description}</p>
              </div>
            )}

            <div className="detail-meta">
              <div className="meta-card">
                <div className="meta-icon">
                  <FaCalendarAlt />
                </div>
                <div className="meta-info">
                  <span>Issue Date</span>
                  <strong>
                    {new Date(certificate.issue_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </strong>
                </div>
              </div>

              {certificate.credential_id && (
                <div className="meta-card">
                  <div className="meta-icon">
                    <FaIdCard />
                  </div>
                  <div className="meta-info">
                    <span>Credential ID</span>
                    <strong>{certificate.credential_id}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="detail-actions">
              {certificate.image_url && !fileIsPDF && (
                <a
                  href={certificate.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <FaExternalLinkAlt /> {fileIsImage ? "View Certificate" : "Open File"}
                </a>
              )}
              {certificate.image_url && (
                <a
                  href={certificate.image_url}
                  download={certificate.image_url.split('/').pop()}
                  className="btn-secondary"
                >
                  <FaDownload /> Download
                </a>
              )}
              <button onClick={handleShare} className="btn-secondary">
                <FaShare /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .certificate-detail-page {
          min-height: 100vh;
          padding: 100px 0 80px;
          background: linear-gradient(135deg, #07070e 0%, #0f0f1a 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #a78bfa;
          text-decoration: none;
          margin-bottom: 32px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 8px 0;
        }

        .back-link:hover {
          gap: 14px;
          color: #c4b5fd;
        }

        .certificate-detail-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 32px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
        }

        /* Image Section */
        .detail-image-section {
          background: linear-gradient(135deg, #1a1a2e, #0f0f1a);
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-container {
          position: relative;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .image-container img {
          width: 100%;
          height: auto;
          display: block;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .image-container.loaded img {
          opacity: 1;
        }

        .image-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        .image-container.loaded .image-shimmer {
          transform: translateX(100%);
        }

        /* PDF Viewer Styles */
        .pdf-viewer-wrapper {
          width: 100%;
          background: #1a1a2e;
          border-radius: 12px;
          overflow: hidden;
        }

        .pdf-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.5);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pdf-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #ef4444;
          font-weight: 500;
        }

        .pdf-toolbar-actions {
          display: flex;
          gap: 12px;
        }

        .pdf-toolbar-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .pdf-toolbar-btn:hover {
          background: rgba(167, 139, 250, 0.3);
          transform: scale(1.05);
        }

        .pdf-iframe {
          width: 100%;
          height: 500px;
          border: none;
        }

        .pdf-footer {
          padding: 12px 16px;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .pdf-footer a {
          color: #a78bfa;
          text-decoration: none;
        }

        .pdf-footer a:hover {
          text-decoration: underline;
        }

        /* File Preview for Non-Images & Non-PDF */
        .file-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
        }

        .file-icon-large {
          font-size: 4rem;
          color: #a78bfa;
          margin-bottom: 20px;
        }

        .file-info-detail h4 {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
        }

        .file-info-detail p {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          word-break: break-all;
          margin-bottom: 16px;
        }

        .file-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .view-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .view-file-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .view-file-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
        }

        .view-file-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* No File */
        .no-file {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          text-align: center;
          color: rgba(255, 255, 255, 0.3);
          gap: 16px;
        }

        .no-file p {
          font-size: 0.9rem;
        }

        /* Info Section */
        .detail-info-section {
          padding: 48px 48px 48px 0;
        }

        .certificate-badge {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(167, 139, 250, 0.15);
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 40px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #a78bfa;
          margin-bottom: 20px;
          letter-spacing: 1px;
        }

        .detail-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.3;
          background: linear-gradient(135deg, #fff, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .detail-description {
          margin-bottom: 32px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border-left: 3px solid #a78bfa;
        }

        .detail-description p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
        }

        .detail-meta {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .meta-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .meta-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }

        .meta-icon {
          width: 48px;
          height: 48px;
          background: rgba(167, 139, 250, 0.15);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #a78bfa;
        }

        .meta-info {
          flex: 1;
        }

        .meta-info span {
          display: block;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .meta-info strong {
          font-size: 0.95rem;
          color: white;
          font-weight: 600;
          word-break: break-all;
        }

        .detail-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        /* Loading State */
        .detail-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: #07070e;
        }

        .spinner {
          width: 56px;
          height: 56px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Not Found */
        .detail-notfound {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 20px;
          background: #07070e;
        }

        .notfound-icon {
          font-size: 5rem;
          opacity: 0.3;
        }

        .detail-notfound h2 {
          font-size: 1.8rem;
          color: white;
        }

        .detail-notfound p {
          color: rgba(255, 255, 255, 0.5);
          max-width: 400px;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .certificate-detail-content {
            grid-template-columns: 1fr;
            gap: 0;
          }
          
          .detail-info-section {
            padding: 32px;
          }
          
          .detail-image-section {
            padding: 32px;
          }
          
          .detail-title {
            font-size: 1.6rem;
          }
          
          .pdf-iframe {
            height: 350px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 16px;
          }
          
          .detail-info-section {
            padding: 24px;
          }
          
          .detail-actions {
            flex-direction: column;
          }
          
          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }
          
          .pdf-iframe {
            height: 280px;
          }
          
          .file-buttons {
            flex-direction: column;
          }
          
          .view-file-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateDetail;