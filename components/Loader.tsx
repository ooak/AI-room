import React from 'react';

type LoaderProps = {
  label?: string;
};

const Loader: React.FC<LoaderProps> = ({ label = 'Generating your makeover...' }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-10">
    <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    <p className="text-indigo-700 font-medium">{label}</p>
  </div>
);

export { Loader };
