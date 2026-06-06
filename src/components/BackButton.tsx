import React from 'react';
import './BackButton.css';

interface Props {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function BackButton({ onClick, label = 'Back', className = '' }: Props) {
  return (
    <button
      type="button"
      className={`back-btn ${className}`.trim()}
      onClick={onClick}
      aria-label={label}
    >
      <svg
        className="back-btn__arrow"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}
