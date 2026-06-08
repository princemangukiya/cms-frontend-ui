import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2>CMS</h2>

      <NavLink
        to="/dashboard"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? "yellow" : "white",
        })}
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/student"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? "yellow" : "white",
        })}
      >
        Student
      </NavLink>

      <NavLink
        to="/staff"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? "yellow" : "white",
        })}
      >
        Staff
      </NavLink>

      <NavLink
        to="/course"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? "yellow" : "white",
        })}
      >
        Course
      </NavLink>

      <NavLink
        to="/result"
        style={({ isActive }) => ({
          ...styles.link,
          color: isActive ? "yellow" : "white",
        })}
      >
        Result
      </NavLink>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "200px",
    height: "100vh",
    background: "#222",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  link: {
    textDecoration: "none",
    fontSize: "16px",
    padding: "5px 0",
  },
};

export default Sidebar;