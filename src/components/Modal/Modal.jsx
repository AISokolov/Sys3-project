import React, { useEffect } from 'react';
import './Modal.css';

function Modal({ title, children, onClose, footer }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-panel__header">
          <h2 className="modal-panel__title">{title}</h2>
          <button type="button" className="modal-panel__close" onClick={onClose} aria-label="Close modal">
            x
          </button>
        </div>
        <div className="modal-panel__body">{children}</div>
        {footer ? <div className="modal-panel__footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Modal;
