import React from 'react';
import './TopButton.css';

function TopButton({ children, variant = 'default', ...props }) {
  return (
    <button type="button" className={`top-button top-button--${variant}`} {...props}>
      {children}
    </button>
  );
}

export default TopButton;
