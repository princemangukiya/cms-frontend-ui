import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  FaTrophy, FaArrowLeft, FaMedal, FaCalendarAlt,
  FaMapMarkerAlt, FaUsers, FaPlus, FaCheckCircle,
  FaTimes, FaRunning, FaFutbol, FaSearch, FaAward,
  FaFire, FaStar
} from 'react-icons/fa';
import { useTheme } from "../context/ThemeContext";

const INITIAL_SPORTS_EVENTS = [
  {
    id: 1,
    title: "Inter-College Cricket Premier League (CPL 2026)",
    category: "Cricket",
    date: "Sept 10 - 15, 2026",
    venue: "Main University Cricket Stadium",
    teamSize: "11 Players + 4 Subs",
    prize: "₹50,000 + Champions Cup",
    status: "Open",
    registeredTeams: 8,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "Annual Football Championship (Super Cup)",
    category: "Football",
    date: "Sept 18 - 22, 2026",
    venue: "Football Ground (East Campus)",
    teamSize: "11 Players",
    prize: "₹35,000 + Gold Medals",
    status: "Open",
    registeredTeams: 12,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 3,
    title: "Badminton Singles & Doubles Open",
    category: "Badminton",
    date: "Sept 25, 2026",
    venue: "Indoor Sports Complex (Court 1 & 2)",
    teamSize: "Single / Double",
    prize: "₹15,000 + Trophies",
    status: "Open",
    registeredTeams: 24,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 4,
    title: "All-Campus 100m, 200m & 4x100m Sprint Meet",
    category: "Athletics",
    date: "Oct 02, 2026",
    venue: "Synthetic Running Track",
    teamSize: "Individual / Relay",
    prize: "₹20,000 + Medals",
    status: "Upcoming",
    registeredTeams: 40,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 5,
    title: "Inter-Department Basketball Blitz",
    category: "Basketball",
    date: "Oct 08, 2026",
    venue: "Hardcourt Arena",
    teamSize: "5 Players",
    prize: "₹25,000 + Trophy",
    status: "Upcoming",
    registeredTeams: 6,
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: 6,
    title: "Grandmasters Chess Championship",
    category: "Indoor",
    date: "Oct 12, 2026",
    venue: "Student Activity Centre (Auditorium)",
    teamSize: "Individual",
    prize: "₹10,000 + Certificate",
    status: "Open",
    registeredTeams: 32,
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=60"
  }
];

function Sports() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("cms_sports_events");
      return saved ? JSON.parse(saved) : INITIAL_SPORTS_EVENTS;
    } catch (e) {
      return INITIAL_SPORTS_EVENTS;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventForRegister, setSelectedEventForRegister] = useState(null);

  const [regForm, setRegForm] = useState({
    teamName: "",
    captainName: "",
    rollNo: "",
    department: "Computer Science",
    mobile: "",
    playerCount: "1"
  });

  const categories = ["All", "Cricket", "Football", "Badminton", "Athletics", "Basketball", "Indoor"];

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regForm.captainName || !regForm.mobile) {
      alert("Please fill all required fields!");
      return;
    }

    const updatedEvents = events.map(ev => {
      if (ev.id === selectedEventForRegister.id) {
        return { ...ev, registeredTeams: ev.registeredTeams + 1 };
      }
      return ev;
    });

    setEvents(updatedEvents);
    localStorage.setItem("cms_sports_events", JSON.stringify(updatedEvents));

    alert(`🎉 Registration Successful for ${selectedEventForRegister.title}! Team: ${regForm.teamName || regForm.captainName}`);
    setSelectedEventForRegister(null);
    setRegForm({ teamName: "", captainName: "", rollNo: "", department: "Computer Science", mobile: "", playerCount: "1" });
  };

  const filteredEvents = events.filter(ev => {
    const matchesCategory = selectedCategory === "All" || ev.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const themeStyles = {
    pageBg: darkMode ? "linear-gradient(135deg, #090d16 0%, #111827 100%)" : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.4)" : "0 15px 35px rgba(0, 0, 0, 0.06)",
    textPrimary: darkMode ? "#f8fafc" : "#1e293b",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    inputBg: darkMode ? "#0f172a" : "#f8fafc",
    inputBorder: darkMode ? "#334155" : "#cbd5e1",
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: themeStyles.pageBg,
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "1250px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Top Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #ea580c 0%, #f97316 40%, #e11d48 100%)",
          borderRadius: "24px", padding: "32px 36px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px",
          boxShadow: "0 12px 35px rgba(234, 88, 12, 0.35)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "14px", display: "flex" }}>
                <FaTrophy size={28} />
              </div>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px" }}>
                Campus Sports & Athletics Portal
              </h1>
            </div>
            <p style={{ margin: "6px 0 0 50px", opacity: 0.95, fontSize: "14px", fontWeight: "500" }}>
              Annual Inter-Department Sports Championship, Live Tournament Fixtures & Registrations
            </p>
          </div>

          <button onClick={() => navigate('/dashboard')} style={{
            display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.4)", color: "#ffffff", padding: "12px 22px",
            borderRadius: "14px", cursor: "pointer", fontWeight: "700", backdropFilter: "blur(10px)"
          }}>
            <FaArrowLeft /> Dashboard
          </button>
        </div>

        {/* 📊 Top Quick Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>

          <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "18px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Active Events</span>
              <FaFutbol color="#ea580c" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: "900", color: themeStyles.textPrimary }}>{events.length} Sports</h2>
            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>● Registrations Open</span>
          </div>

          <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "18px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Registered Athletes</span>
              <FaUsers color="#6366f1" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: "900", color: "#6366f1" }}>180+ Teams</h2>
            <span style={{ fontSize: "11px", color: themeStyles.textSecondary, fontWeight: "600" }}>Across all 6 Departments</span>
          </div>

          <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "18px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Total Prize Pool</span>
              <FaTrophy color="#eab308" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: "900", color: "#eab308" }}>₹1,55,000</h2>
            <span style={{ fontSize: "11px", color: "#eab308", fontWeight: "700" }}>Cash + Gold Trophies</span>
          </div>

          <div style={{ background: themeStyles.cardBg, padding: "20px", borderRadius: "18px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary, textTransform: "uppercase" }}>Leading Department</span>
              <FaMedal color="#10b981" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "24px", fontWeight: "900", color: "#10b981" }}>CSE Titans</h2>
            <span style={{ fontSize: "11px", color: themeStyles.textSecondary, fontWeight: "600" }}>120 Championship Points</span>
          </div>
        </div>

        {/* Search & Category Filter Tabs */}
        <div style={{
          background: themeStyles.cardBg, borderRadius: "20px", padding: "18px 24px",
          border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px"
        }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 18px", borderRadius: "12px", border: "none", fontSize: "13px", fontWeight: "700",
                  cursor: "pointer", transition: "all 0.2s ease",
                  background: selectedCategory === cat
                    ? "linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
                    : (darkMode ? "#0f172a" : "#f1f5f9"),
                  color: selectedCategory === cat ? "#ffffff" : themeStyles.textSecondary,
                  boxShadow: selectedCategory === cat ? "0 4px 12px rgba(234, 88, 12, 0.3)" : "none"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "8px", background: themeStyles.inputBg,
            padding: "8px 16px", borderRadius: "12px", border: `1.5px solid ${themeStyles.inputBorder}`, width: "260px"
          }}>
            <FaSearch color={themeStyles.textSecondary} size={14} />
            <input
              type="text"
              placeholder="Search sports events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: themeStyles.textPrimary, fontSize: "13px", width: "100%" }}
            />
          </div>
        </div>

        {/* 🏟️ Sports Event Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
          {filteredEvents.map((item) => (
            <div
              key={item.id}
              style={{
                background: themeStyles.cardBg, borderRadius: "22px", overflow: "hidden",
                border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow,
                display: "flex", flexDirection: "column", transition: "transform 0.2s ease"
              }}
            >
              {/* Event Image Banner */}
              <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span style={{
                  position: "absolute", top: "14px", right: "14px",
                  background: item.status === "Open" ? "rgba(16, 185, 129, 0.9)" : "rgba(245, 158, 11, 0.9)",
                  color: "#ffffff", padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800",
                  backdropFilter: "blur(4px)"
                }}>
                  {item.status === "Open" ? "🟢 OPEN FOR ENTRY" : "🟡 UPCOMING"}
                </span>

                <span style={{
                  position: "absolute", bottom: "14px", left: "14px",
                  background: "rgba(0, 0, 0, 0.75)", color: "#ffffff", padding: "4px 10px",
                  borderRadius: "8px", fontSize: "11px", fontWeight: "700", backdropFilter: "blur(4px)"
                }}>
                  🏆 {item.prize}
                </span>
              </div>

              {/* Event Content */}
              <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  {item.title}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: themeStyles.textSecondary }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaCalendarAlt color="#ea580c" /> <strong>Date:</strong> {item.date}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaMapMarkerAlt color="#ea580c" /> <strong>Venue:</strong> {item.venue}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaUsers color="#ea580c" /> <strong>Format:</strong> {item.teamSize} • <strong>{item.registeredTeams} Teams Registered</strong>
                  </div>
                </div>

                <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: `1px solid ${themeStyles.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#10b981" }}>Free Entry for Students</span>
                  <button
                    onClick={() => setSelectedEventForRegister(item)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px",
                      background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "white",
                      border: "none", borderRadius: "10px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(234, 88, 12, 0.35)"
                    }}
                  >
                    <FaPlus size={10} /> Register Team
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ⚔️ Live Match Fixtures & Leaderboard Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "24px", marginTop: "10px" }}>

          {/* Recent Match Results Card */}
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "28px",
            border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
          }}>
            <h3 style={{ margin: "0 0 18px 0", fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaFire color="#ea580c" /> Live Matches & Recent Results
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: darkMode ? "#0f172a" : "#f8fafc", padding: "14px", borderRadius: "14px", border: `1px solid ${themeStyles.cardBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: themeStyles.textSecondary, marginBottom: "4px" }}>
                  <span>🏏 Cricket Semifinal 1</span>
                  <span style={{ color: "#10b981", fontWeight: "700" }}>● COMPLETED</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "800", fontSize: "14px", color: themeStyles.textPrimary }}>
                  <span>CSE Warriors (164/4)</span>
                  <span style={{ color: "#ea580c" }}>vs</span>
                  <span>Mech Titans (142/8)</span>
                </div>
                <div style={{ fontSize: "11px", color: "#10b981", marginTop: "4px", fontWeight: "700" }}>Winner: CSE Warriors by 22 runs 🏆</div>
              </div>

              <div style={{ background: darkMode ? "#0f172a" : "#f8fafc", padding: "14px", borderRadius: "14px", border: `1px solid ${themeStyles.cardBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: themeStyles.textSecondary, marginBottom: "4px" }}>
                  <span>⚽ Football Quarterfinal</span>
                  <span style={{ color: "#ef4444", fontWeight: "700" }}>● LIVE NOW</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "800", fontSize: "14px", color: themeStyles.textPrimary }}>
                  <span>IT Strikers (2)</span>
                  <span style={{ color: "#ea580c" }}>vs</span>
                  <span>Civil United (1)</span>
                </div>
                <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", fontWeight: "700" }}>78th Minute • Second Half 🔥</div>
              </div>
            </div>
          </div>

          {/* Medals Tally Leaderboard */}
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "28px",
            border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
          }}>
            <h3 style={{ margin: "0 0 18px 0", fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaAward color="#eab308" /> Department Championship Tally
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "12px", background: "rgba(234, 179, 8, 0.12)", border: "1px solid rgba(234, 179, 8, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: "900", fontSize: "16px" }}>🥇</span>
                  <strong style={{ color: themeStyles.textPrimary }}>Computer Science & Engg</strong>
                </div>
                <span style={{ fontWeight: "800", color: "#eab308" }}>120 Pts (5 Gold)</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "12px", background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${themeStyles.cardBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: "900", fontSize: "16px" }}>🥈</span>
                  <strong style={{ color: themeStyles.textPrimary }}>Mechanical Engineering</strong>
                </div>
                <span style={{ fontWeight: "800", color: themeStyles.textSecondary }}>95 Pts (3 Gold)</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "12px", background: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${themeStyles.cardBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontWeight: "900", fontSize: "16px" }}>🥉</span>
                  <strong style={{ color: themeStyles.textPrimary }}>Electronics & Comm</strong>
                </div>
                <span style={{ fontWeight: "800", color: themeStyles.textSecondary }}>80 Pts (2 Gold)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 🎟️ ATHLETE / TEAM REGISTRATION MODAL */}
      {selectedEventForRegister && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "34px", maxWidth: "520px", width: "92%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${themeStyles.cardBorder}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  Register for {selectedEventForRegister.category}
                </h3>
                <span style={{ fontSize: "12px", color: "#ea580c", fontWeight: "700" }}>{selectedEventForRegister.title}</span>
              </div>
              <button onClick={() => setSelectedEventForRegister(null)} style={{ background: "none", border: "none", color: themeStyles.textSecondary, cursor: "pointer", fontSize: "18px" }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>TEAM NAME (OR SOLO ATHLETE)</label>
                <input
                  type="text"
                  placeholder="e.g. CS Warriors / John Doe"
                  value={regForm.teamName}
                  onChange={(e) => setRegForm({ ...regForm, teamName: e.target.value })}
                  style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>CAPTAIN NAME *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={regForm.captainName}
                    onChange={(e) => setRegForm({ ...regForm, captainName: e.target.value })}
                    style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>ROLL NUMBER *</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-101"
                    required
                    value={regForm.rollNo}
                    onChange={(e) => setRegForm({ ...regForm, rollNo: e.target.value })}
                    style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>DEPARTMENT</label>
                  <select
                    value={regForm.department}
                    onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                    style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Tech">Information Tech</option>
                    <option value="Mechanical Engg">Mechanical Engg</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>MOBILE NUMBER *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    required
                    value={regForm.mobile}
                    onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setSelectedEventForRegister(null)} style={{ padding: "10px 20px", borderRadius: "10px", border: `1px solid ${themeStyles.inputBorder}`, background: "none", color: themeStyles.textSecondary, fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "white", fontWeight: "800", cursor: "pointer", boxShadow: "0 6px 20px rgba(234, 88, 12, 0.4)" }}>Confirm Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sports;