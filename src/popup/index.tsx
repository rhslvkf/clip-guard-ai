import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold">Clip Guard AI</h1>
      <p className="text-text-secondary mt-2">Build system configured!</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
