import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Auth.css';

/**
 * UserLogin
 * Simple login form with required validation and navigation to register.
 */
function UserLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required.';
    else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(form.email)) next.email = 'Please enter a valid email address.';
    }
    if (!form.password.trim()) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await login(form.email, form.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrors((prev) => ({ ...prev, login: res.error }));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const email = prompt("Enter your registered email address for password reset:");
    if (!email || !email.trim()) return;

    try {
      const res = await api.post('accounts/forgot-password/', { email: email.trim() });
      alert(res.data.detail);
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = "Failed to request password reset.";
      if (data) {
        errorMsg = data.detail || data.email?.[0] || errorMsg;
      }
      alert(errorMsg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" role="main" aria-labelledby="login-title">
        <div className="auth-logo" aria-hidden>
          AF
        </div>

        <div className="auth-title">
          <h1 id="login-title">AssetFlow - Login</h1>
          <p className="muted">Enterprise Asset & Resource Management System</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="password-row">
              <label htmlFor="password">Password</label>
              <a className="forgot-link" href="#" onClick={handleForgotPassword}>Forgot Password?</a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {errors.login && <span className="error-text" style={{ textAlign: 'center' }}>{errors.login}</span>}

          <button className="auth-button" type="submit">Login</button>

          <Link to="/register" className="secondary-button">Create Employee Account</Link>
        </form>

        <div className="form-footer">
          <strong>New here?</strong>
          <p>Sign up creates an employee account. Admin roles are assigned later.</p>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
