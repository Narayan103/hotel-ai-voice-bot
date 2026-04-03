import React from 'react';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🏨 Hotel AI Assistant</h1>
        <p>Grand Palace Hotel — 24/7 Voice Support</p>
      </div>
      <div className="app-body">
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;