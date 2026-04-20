import React from 'react';
import './AppHeader.css';

function AppHeader({ title, actions }) {
  return (
    <header className="app-header">
      <div className="app-container app-header__inner">
        <h1 className="app-header__title">{title}</h1>
        <div className="app-header__actions">{actions}</div>
      </div>
    </header>
  );
}

export default AppHeader;
