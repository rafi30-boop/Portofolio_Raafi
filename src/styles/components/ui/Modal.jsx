import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

const Modal = ({ isOpen, onClose, title, children }) => {
  // Lock scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "auto";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "auto";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 9998,
              cursor: "pointer",
            }}
            className="modal-overlay"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(95%, 920px)",
              maxHeight: "calc(100vh - 4rem)",
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.22)",
              zIndex: 9999,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            className="modal"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
              className="modal-header"
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  margin: 0,
                  color: "#111827",
                }}
                className="modal-title"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  color: "#6b7280",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.375rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>

            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
              }}
              className="modal-body"
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
