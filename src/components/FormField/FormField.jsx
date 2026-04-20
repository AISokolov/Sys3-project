import React from 'react';
import './FormField.css';

function FormField({ label, children, hint }) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      {children}
      {hint ? <span className="form-field__hint">{hint}</span> : null}
    </label>
  );
}

export default FormField;
