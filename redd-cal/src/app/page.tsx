import Calculator from '../components/Calculator';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a0000 0%, #2d0000 50%, #1a0000 100%)',
        padding: '20px',
      }}
    >
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ff4444',
            letterSpacing: '0.1em',
            textShadow: '0 0 20px rgba(255, 68, 68, 0.5)',
          }}
        >
          🔴 {process.env.NEXT_PUBLIC_APP_NAME || 'Redd Cal'}
        </h1>
        <p style={{ color: '#ff9999', fontSize: '0.875rem', marginTop: '4px' }}>
          Productivity Calculator
        </p>
      </div>
      <Calculator />
    </main>
  );
}
