import React, { useState } from 'react';
import './Login.css';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Login = () => {
      const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement login logic here
    console.log('Login attempt:', formData);
  };

//   const handleGoogleSignIn = () => {
//     const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
//       `client_id=${GOOGLE_CLIENT_ID}` +
//       `&redirect_uri=${encodeURIComponent(q)}` +
//       `&response_type=code` +
//       `&scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')}` +
//       `&access_type=offline` +
//       `&prompt=consent`;
//
//     window.location.href = googleAuthUrl;
//   };

    const handleGoogleSignIn = async (response) => {
      setIsLoading(true);
      try {
        const res = await axios.post("http://localhost:8080/api/auth/google", {
          token: response.credential,
        });

        if (res.data && res.data.token) {
          localStorage.setItem("authToken", res.data.token);
        }

        // Redirect to dashboard
        navigate("/profile");
      } catch (error) {
        console.error("Google Login Error:", error);
        setErrors({ general: "Google login failed. Please try again." });
      } finally {
        setIsLoading(false);
      }
    };

  return (
      <GoogleOAuthProvider clientId={googleClientId}>
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please sign in to your account</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <GoogleLogin
              onSuccess={handleGoogleSignIn}
              onError={() =>
                setErrors({
                  general: "Google login failed. Please try again.",
                })
              }
              useOneTap
              theme="outline"
              size="large"
              width="300"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          <div className="register-link">
            Don't have an account? <a href="#">Register</a>
          </div>
        </form>
      </div>
    </div>
        </GoogleOAuthProvider>

  );
};

export default Login; 