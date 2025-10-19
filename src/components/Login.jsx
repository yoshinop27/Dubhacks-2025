import React from 'react';
import { IceCream } from 'lucide-react';
import { useAuth } from '../AuthContext';

function Login() {
  const { signinWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signinWithGoogle();
    } catch (error) {
      console.error("Failed to sign in with Google", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <IceCream size={40} />
          </div>
          <h1>Digital Fridge</h1>
          <p>Your smart kitchen companion</p>
        </div>
        <button className="login-button" onClick={handleSignIn}>Sign In With Google</button>
      </div>
    </div>
  );
}

export default Login;