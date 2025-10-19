import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import './App.css';

function App() {
  const { currentUser, signinWithGoogle, signout } = useAuth();

  // Log the user object to the console whenever it changes
  useEffect(() => {
    if (currentUser) {
      console.log('Current User Object:', currentUser);
    }
  }, [currentUser]);

  const handleSignIn = async () => {
    try {
      await signinWithGoogle();
    } catch (error) {
      console.error('Failed to sign in', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="fridge-icon">🧊</div>
        <h1>Digital Fridge</h1>
        <p className="subtitle">Your smart kitchen companion.</p>
      </header>

      <main className="App-main">
        {currentUser ? (
          <div className="welcome-container">
            <h2>Welcome, {currentUser.displayName}!</h2>
            <img src={currentUser.photoURL} alt="User avatar" className="user-avatar" />
            <p style={{ fontSize: '0.8rem', wordBreak: 'break-all', background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
              <strong>Your Unique User ID:</strong><br/>
              {currentUser.uid}
            </p>
            <button className="btn btn-logout" onClick={signout}>Sign Out</button>
          </div>
        ) : (
          <div className="login-container">
            <h2>Get Started</h2>
            <button className="btn btn-login" onClick={handleSignIn}>Sign in with Google</button>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>&copy; 2024 Digital Fridge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;