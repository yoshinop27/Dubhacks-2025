import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      // For now, simulate login with mock user data
      // Later this will integrate with Amazon Cognito
      const mockUser = {
        name: credentials.username,
        email: `${credentials.username}@example.com`,
        phone: '',
        location: ''
      };
      onLogin(mockUser);
    } else {
      alert('Please enter both username and password');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <User size={48} />
          </div>
          <h1>Welcome to Digital Fridge</h1>
          <p>Sign in to manage your fridge</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">
              <User size={20} />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <Lock size={20} />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            <LogIn size={20} />
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
