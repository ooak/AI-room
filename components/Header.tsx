import React from 'react';

import './Header.css';

export const Header: React.FC = () => (
  <header className="app-header">
    <div className="app-header__content">
      <h1 className="app-header__title">AI Room Makeover</h1>
      <p className="app-header__subtitle">
        Upload or capture your room, describe your dream vibe, and we will redesign it instantly
        with shoppable furniture picks.
      </p>
    </div>
  </header>
);
