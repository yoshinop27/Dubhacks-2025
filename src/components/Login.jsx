import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, LogIn } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInfo.name && userInfo.email) {
      onLogin(userInfo);
    } else {
      alert('Please fill in at least your name and email');
    }
  };

  const handleChange = (e) => {
    setUserInfo({
      ...userInfo,
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
          <p>Let's get to know you better!</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="name">
              <User size={20} />
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={userInfo.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">
              <Mail size={20} />
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userInfo.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">
              <Phone size={20} />
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={userInfo.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="input-group">
            <label htmlFor="location">
              <MapPin size={20} />
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={userInfo.location}
              onChange={handleChange}
              placeholder="Enter your city/location"
            />
          </div>

          <button type="submit" className="login-button">
            <LogIn size={20} />
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
