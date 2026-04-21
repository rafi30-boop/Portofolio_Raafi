// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import CSS in correct order
import './styles/variables.css';
import './styles/globals.css';
import './styles/components/button.css';
import './styles/components/card.css';
import './styles/components/navbar.css';
import './styles/components/modal.css';
import './styles/components/input.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);