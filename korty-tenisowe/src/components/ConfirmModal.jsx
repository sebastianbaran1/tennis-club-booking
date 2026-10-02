import { useEffect } from "react";
import "./Modal.css";

export default function ConfirmModal({
  title,
  subtitle,
  highlight,
  cancelText,
  confirmText,
  handleConfirm,
  onClose,
}) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal__title">{title}</h2>
        <p className="modal__subtitle">
          {subtitle}
          <span className="modal__subtitle-highlight">{highlight}</span>
          ? <br />
          Tej operacji nie można cofnąć.
        </p>

        <div className="modal__buttons">
          <button className="modal__button-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="modal__button-confirm" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
