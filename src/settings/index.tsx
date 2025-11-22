import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function Settings() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold">Settings</h1>
      <p className="text-text-secondary mt-2">Settings page placeholder</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>
);
