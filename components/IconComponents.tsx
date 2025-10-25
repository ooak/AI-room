import React from 'react';

const iconClasses = 'h-6 w-6';

const CameraIcon: React.FC = () => (
  <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h2l1.6-2.4A1 1 0 0 1 8.5 4h7a1 1 0 0 1 .83.45L18 7h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

const UploadIcon: React.FC = () => (
  <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 16V4" />
    <path d="m6 10 6-6 6 6" />
    <path d="M4 20h16" />
  </svg>
);

export { CameraIcon, UploadIcon };
