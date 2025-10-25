import React from 'react';

const Header: React.FC = () => (
  <header className="w-full bg-indigo-600 text-white py-6 shadow-md">
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold">AI Room Makeover</h1>
      <p className="mt-2 text-indigo-100">
        Transform your space with AI-powered redesign suggestions and curated shopping recommendations.
      </p>
    </div>
  </header>
);

export { Header };
