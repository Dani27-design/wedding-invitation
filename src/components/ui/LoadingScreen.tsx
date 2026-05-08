export const LoadingScreen = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FDFCF8',
    color: '#1A1A1A',
    fontFamily: "'Cormorant Garamond', serif",
    textAlign: 'center',
    padding: '2rem',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
  }}>
    <style>{`
      @font-face { font-family: 'Dayland'; src: url('/fonts/Dayland.ttf') format('truetype'); font-display: swap; }
      @keyframes loading-pulse{0%,100%{opacity:.2;transform:scaleX(.6)}50%{opacity:.6;transform:scaleX(1)}}
      @keyframes loading-fade{0%,100%{opacity:.4}50%{opacity:.8}}
    `}</style>
    <h1 style={{
      fontFamily: "'Dayland', cursive",
      fontSize: '3rem',
      letterSpacing: '.02em',
      marginBottom: '1.5rem',
      animation: 'loading-fade 3s ease-in-out infinite'
    }}>
      Dani & Marini
    </h1>
    <div style={{
      width: '4rem',
      height: '1px',
      background: '#B48D3E',
      marginBottom: '1.5rem',
      animation: 'loading-pulse 2s ease-in-out infinite'
    }} />
    <p style={{
      fontSize: '.6rem',
      letterSpacing: '.3em',
      textTransform: 'uppercase',
      color: '#B48D3E',
      fontWeight: 700,
      opacity: .6
    }}>
      Memuat undangan
    </p>
  </div>
);
