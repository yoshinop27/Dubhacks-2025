import React from 'react';
import { useAuth } from './AuthContext';
import Login from './components/Login'; // Assuming you have this component
import Home from './components/Home';   // Assuming you have this component
import './App.css';

function App() {
  const { currentUser } = useAuth();

  return (
    <div className="app">
      {currentUser ? (
        // If user is logged in, show the main app
        <Home />
      ) : (
        // Otherwise, show the login page
        <Login />
      )}
    </div>
  );
}

export default App;