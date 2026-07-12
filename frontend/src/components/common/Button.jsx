import React from 'react';
import './Button.css';

function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`button button--${variant} ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}

export default Button;
