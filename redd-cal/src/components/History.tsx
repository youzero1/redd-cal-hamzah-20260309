'use client';

import React from 'react';

interface HistoryEntry {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntry: (result: string) => void;
}

export default function History({ isOpen, onClose, onSelectEntry }: HistoryProps) {
  const [entries, setEntries] = React.useState<HistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEntries(data.history || []);
    } catch {
      setError('Could not load history');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setEntries([]);
    } catch {
      setError('Could not clear history');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '100%',
        maxWidth: '360px',
        height: '100vh',
        background: 'linear-gradient(180deg, #1a0000 0%, #0d0000 100%)',
        borderLeft: '1px solid #550000',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        animation: 'slideIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #440000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(204,0,0,0.05)',
        }}
      >
        <h2 style={{ color: '#ff4444', fontSize: '1.1rem', fontWeight: '600' }}>📋 History</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {entries.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                background: 'rgba(204,0,0,0.2)',
                color: '#ff9999',
                border: '1px solid #660000',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(204,0,0,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(204,0,0,0.2)')}
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#ff9999',
              border: '1px solid #440000',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            ✕
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: '#993333', padding: '40px 20px' }}>
            Loading...
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', color: '#ff6666', padding: '20px' }}>
            {error}
          </div>
        )}
        {!loading && !error && entries.length === 0 && (
          <div style={{ textAlign: 'center', color: '#660000', padding: '40px 20px', fontSize: '0.875rem' }}>
            No calculations yet.
            <br />
            <span style={{ fontSize: '2rem', display: 'block', marginTop: '12px' }}>🧮</span>
          </div>
        )}
        {!loading &&
          entries.map(entry => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry.result)}
              style={{
                background: 'linear-gradient(135deg, rgba(61,0,0,0.6), rgba(45,0,0,0.6))',
                border: '1px solid #440000',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background =
                  'linear-gradient(135deg, rgba(80,0,0,0.8), rgba(60,0,0,0.8))';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#660000';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background =
                  'linear-gradient(135deg, rgba(61,0,0,0.6), rgba(45,0,0,0.6))';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#440000';
              }}
            >
              <div
                style={{
                  color: '#cc9999',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {entry.expression}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    color: '#ff4444',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'monospace',
                  }}
                >
                  = {entry.result}
                </span>
                <span style={{ color: '#660000', fontSize: '0.7rem' }}>
                  {formatDate(entry.createdAt)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
