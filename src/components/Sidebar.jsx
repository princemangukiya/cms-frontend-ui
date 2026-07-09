import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div style={styles.sidebar}>
      {/* Naya Profile Section */}
      <div style={styles.profileContainer}>
        <div style={styles.avatar}>S</div>
        <div style={styles.textContainer}>
          <div style={{ fontWeight: 'bold' }}>Sarthak</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>sarthak123@gmail.com</div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: "18px" }}>CMS Portal</h2>
      </div>

      <NavLink to="/dashboard" style={({ isActive }) => ({ ...styles.link, color: isActive ? "yellow" : "white" })}>Dashboard</NavLink>
      <NavLink to="/student" style={({ isActive }) => ({ ...styles.link, color: isActive ? "yellow" : "white" })}>Student</NavLink>
      {/* Baki links... */}

      <div style={{ marginTop: "auto" }}>
        <button style={styles.logoutBtn}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: { width: "200px", height: "100vh", background: "#222", color: "white", padding: "20px", display: "flex", flexDirection: "column" },
  profileContainer: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%", background: "#444", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" },
  textContainer: { display: "flex", flexDirection: "column" },
  link: { textDecoration: "none", fontSize: "16px", padding: "10px 0", display: "block" },
  logoutBtn: { background: "#ff4d4d", color: "white", border: "none", padding: "10px", cursor: "pointer", borderRadius: "5px" }
};

export default Sidebar;