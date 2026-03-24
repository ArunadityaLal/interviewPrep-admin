import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="field">
      {label ? <span className="field-label">{label}</span> : null}
      <input className={`field-input ${className}`.trim()} {...props} />
    </label>
  );
}
