import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

// Initial empty form state
const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  gender: '', // optional
  password: '',
  confirmPassword: '',
};

/**
 * UserRegister
 * Registration form for creating employee accounts.
 * Controlled inputs, client-side validation. Ready to connect to an API.
 */
function UserRegister() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Handle controlled input changes. Phone accepts only digits.
  const handleChange = (e) => {
    const { name, value } = e.target;

    // enforce digits-only for phone
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      setForm((p) => ({ ...p, [name]: digits }));
      setErrors((p) => ({ ...p, phone: '' }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  // Validation rules
  const validate = () => {
    const next = {};

    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email address is required.';
    else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(form.email)) next.email = 'Please enter a valid email address.';
    }

    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    else if (!/^\d{6,15}$/.test(form.phone)) next.phone = 'Enter a valid phone number (6-15 digits).';

    // Gender is optional

    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';

    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Submit handler - stubbed to show message. Replace with API call.
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validate()) return;

    // TODO: integrate with backend (Axios POST to /api/register/)

    setSuccessMessage(
      'Your employee account has been created successfully. An administrator will assign your department and role.'
    );
    setForm(initialForm);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" role="main" aria-labelledby="register-title">
        <div className="auth-logo" aria-hidden>
          AF
        </div>

        <div className="auth-title">
          <h1 id="register-title">AssetFlow - Register</h1>
          <p className="muted">Enterprise Asset & Resource Management System</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

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
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Only digits"
              value={form.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender (optional)</label>
            <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button className="auth-button" type="submit">
            Create Employee Account
          </button>

          {successMessage && <p className="success-text">{successMessage}</p>}
        </form>

        <p className="login-link muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default UserRegister;
