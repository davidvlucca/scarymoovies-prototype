export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>SCARY MOOVIES</h1>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Scaffold — S1 complete</p>
    </main>
  )
}
