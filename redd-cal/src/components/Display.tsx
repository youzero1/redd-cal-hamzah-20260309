'use client';

import React from 'react';

interface DisplayProps {
  expression: string;
  current: string;
  hasError: boolean;
}

export default function Display({ expression, current, hasError }: DisplayProps) {
  const fontSize = current.length > 12 ? '1.5rem' : current.length > 8 ? '2rem' : '2.8rem';

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #0d0000 0%, #1a0000 100%)',
        borderRadius: '16px',
        padding: '20px 24px 16px',
        marginBottom: '16px',
        border: '1px solid #440000',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6), 0 0 20px rgba(204,0,0,0.1)',
        minHeight: '110px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: '0.8rem',
          color: '#993333',
          textAlign: 'right',
          minHeight: '22px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginBottom: '6px',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
        }}
      >
        {expression}
      </div>
      <div
        style={{
          fontSize,
          fontWeight: '300',
          textAlign: 'right',
          color: hasError ? '#ff6666' : '#ffffff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace',
          textShadow: hasError ? '0 0 10px rgba(255,102,102,0.5)' : '0 0 10px rgba(255,255,255,0.1)',
          transition: 'font-size 0.1s ease',
          letterSpacing: '-0.02em',
        }}
      >
        {current}
      </div>
    </div>
  );
}
