'use client';

import React from 'react';

type ButtonVariant = 'number' | 'operator' | 'equals' | 'function' | 'zero';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  number: {
    background: 'linear-gradient(145deg, #3d0000, #2d0000)',
    color: '#ffffff',
    border: '1px solid #550000',
  },
  operator: {
    background: 'linear-gradient(145deg, #800000, #660000)',
    color: '#ffcccc',
    border: '1px solid #990000',
  },
  equals: {
    background: 'linear-gradient(145deg, #cc0000, #990000)',
    color: '#ffffff',
    border: '1px solid #ff1a1a',
  },
  function: {
    background: 'linear-gradient(145deg, #4d0000, #3a0000)',
    color: '#ff9999',
    border: '1px solid #660000',
  },
  zero: {
    background: 'linear-gradient(145deg, #3d0000, #2d0000)',
    color: '#ffffff',
    border: '1px solid #550000',
    gridColumn: 'span 2',
  },
};

const hoverStyles: Record<ButtonVariant, string> = {
  number: '#550000',
  operator: '#990000',
  equals: '#ff1a1a',
  function: '#5a0000',
  zero: '#550000',
};

export default function Button({ label, onClick, variant = 'number', disabled = false }: ButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const baseStyle: React.CSSProperties = {
    ...variantStyles[variant],
    padding: '18px 10px',
    fontSize: variant === 'equals' ? '1.5rem' : '1.1rem',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.1s ease',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
    boxShadow: isPressed
      ? 'inset 0 2px 4px rgba(0,0,0,0.5)'
      : '0 4px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(255,68,68,0.1)',
    transform: isPressed ? 'translateY(2px) scale(0.97)' : isHovered ? 'translateY(-1px)' : 'none',
    backgroundImage: isHovered
      ? `linear-gradient(145deg, ${hoverStyles[variant]}, ${hoverStyles[variant]})`
      : variantStyles[variant].background as string,
  };

  return (
    <button
      style={baseStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      aria-label={label}
    >
      {label}
    </button>
  );
}
