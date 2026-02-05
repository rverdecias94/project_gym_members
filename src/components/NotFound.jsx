const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      marginTop: '-5rem'
    }}>
      <img src="/404.png" alt="" />
      <p style={{
        fontSize: '1.2rem',
        color: '#666',
        marginBottom: '2rem'
      }}>Oops! Página no encontrada.</p>
    </div>
  );
};

export default NotFound;