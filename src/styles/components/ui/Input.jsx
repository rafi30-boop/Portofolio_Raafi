import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, required = false, placeholder = '', rows = null }) => {
  const Component = rows ? 'textarea' : 'input';
  
  return (
    <div className="input-group">
      {label && <label className="input-label">{label} {required && '*'}</label>}
      <Component
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className={`input ${rows ? 'input-textarea' : ''}`}
      />
    </div>
  );
};

export default Input;