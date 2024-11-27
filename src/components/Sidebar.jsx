

const Sidebar = () => {
  return (
    <div style={{
      width: "250px",
      height: "100vh",
      backgroundColor: "#217b7c",
      color: "white",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      boxSizing: "border-box"
    }}>
      <h2>Sidebar</h2>
      <nav>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          <li><a href="/panel" style={{ color: "white", textDecoration: "none" }}>Dashboard</a></li>
          <li><a href="/clientes" style={{ color: "white", textDecoration: "none" }}>Clientes</a></li>
          <li><a href="/entrenadores" style={{ color: "white", textDecoration: "none" }}>Entrenadores</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
