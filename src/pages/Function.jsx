import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt, FaArrowLeft, FaTicketAlt, FaMusic,
  FaMicrophone, FaGraduationCap, FaCamera, FaClock,
  FaMapMarkerAlt, FaUsers, FaStar, FaTimes, FaQrcode,
  FaCheckCircle, FaSearch, FaAward, FaHeart
} from 'react-icons/fa';
import { useTheme } from "../context/ThemeContext";

const FEST_EVENTS = [
  {
    id: 1,
    title: "Tarang 2026: Grand Annual Cultural Fest",
    category: "Cultural",
    date: "October 14, 2026 • 05:00 PM",
    venue: "Main Open Air Amphitheatre",
    chiefGuest: "Celebrity Singer & Music Band",
    status: "Open",
    registeredCount: 450,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60",
    description: "The biggest cultural extravaganza with traditional dance, rock band clash, fashion show, and drama performances."
  },
  {
    id: 2,
    title: "Technova 2026: 36-Hour National Hackathon",
    category: "Technical",
    date: "October 20 - 21, 2026 • 09:00 AM",
    venue: "Advanced Innovation & AI Centre",
    chiefGuest: "Google & Microsoft Tech Leads",
    status: "Open",
    registeredCount: 320,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60",
    description: "Build cutting-edge AI and Web3 solutions. Total cash pool of ₹2,50,000 + On-spot internship offers."
  },
  {
    id: 3,
    title: "Star DJ & EDM Musical Concert Night",
    category: "Music",
    date: "October 28, 2026 • 07:00 PM",
    venue: "Central Stadium Grounds",
    chiefGuest: "International DJ Artist",
    status: "Fast Filling",
    registeredCount: 890,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    description: "High-octane lasers, EDM drops, and non-stop music for an unforgettable university night."
  },
  {
    id: 4,
    title: "University Convocation Ceremony 2026",
    category: "Convocation",
    date: "November 05, 2026 • 10:00 AM",
    venue: "Grand Convention Auditorium",
    chiefGuest: "Hon'ble Vice Chancellor & Education Minister",
    status: "Upcoming",
    registeredCount: 650,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60",
    description: "Conferment of degrees and gold medal honors to graduating batches."
  },
  {
    id: 5,
    title: "Inter-College Dance Battle: 'Nritya'",
    category: "Dance",
    date: "November 12, 2026 • 04:00 PM",
    venue: "Kala Bhawan Auditorium",
    chiefGuest: "National Dance Choreographers",
    status: "Open",
    registeredCount: 180,
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=60",
    description: "Solo, duo, and group western & classical dance competitions."
  },
  {
    id: 6,
    title: "Frames & Shadows: Art & Photography Expo",
    category: "Art",
    date: "November 18, 2026 • 11:00 AM",
    venue: "Art Gallery & Exhibition Hall",
    chiefGuest: "Renowned Visual Artists",
    status: "Open",
    registeredCount: 95,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=60",
    description: "Showcase your original paintings, digital artworks, and campus photography."
  }
];

function FunctionPage() {
  const navigate = useNavigate();
  const themeContext = useTheme();
  const darkMode = themeContext?.darkMode ?? false;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("cms_college_events");
      return saved ? JSON.parse(saved) : FEST_EVENTS;
    } catch (e) {
      return FEST_EVENTS;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPassEvent, setSelectedPassEvent] = useState(null);
  const [issuedPass, setIssuedPass] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    studentName: user?.fullName || user?.full_name || "",
    rollNo: user?.user_id || "CS-101",
    department: "Computer Science",
    passesCount: "1",
    passType: "VIP Student Pass"
  });

  const categories = ["All", "Cultural", "Technical", "Music", "Convocation", "Dance", "Art"];

  const handleBookPass = (e) => {
    e.preventDefault();
    if (!bookingForm.studentName) {
      alert("Please enter student name!");
      return;
    }

    const passData = {
      passId: "PASS-" + Math.floor(100000 + Math.random() * 900000),
      eventTitle: selectedPassEvent.title,
      date: selectedPassEvent.date,
      venue: selectedPassEvent.venue,
      studentName: bookingForm.studentName,
      rollNo: bookingForm.rollNo,
      department: bookingForm.department,
      passType: bookingForm.passType,
      passesCount: bookingForm.passesCount,
    };

    setIssuedPass(passData);
    setSelectedPassEvent(null);
  };

  const filteredEvents = events.filter(ev => {
    const matchesCat = selectedCategory === "All" || ev.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const themeStyles = {
    pageBg: darkMode ? "linear-gradient(135deg, #090d16 0%, #150d2a 100%)" : "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
    cardBg: darkMode ? "#1a162b" : "#ffffff",
    cardBorder: darkMode ? "rgba(168, 85, 247, 0.2)" : "#e9d5ff",
    cardShadow: darkMode ? "0 20px 40px rgba(0, 0, 0, 0.5)" : "0 15px 35px rgba(168, 85, 247, 0.08)",
    textPrimary: darkMode ? "#f8fafc" : "#1e1b4b",
    textSecondary: darkMode ? "#c084fc" : "#6b21a8",
    inputBg: darkMode ? "#0f0b1e" : "#fdf4ff",
    inputBorder: darkMode ? "#4c1d95" : "#d8b4fe",
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100vw", background: themeStyles.pageBg,
      padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-event-pass, #printable-event-pass * { visibility: visible; }
          #printable-event-pass {
            position: fixed; left: 50%; top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: none !important;
            border: 2px solid #7c3aed !important;
            width: 480px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "1280px", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* Aesthetic Gradient Hero Header */}
        <div style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #f43f5e 100%)",
          borderRadius: "24px", padding: "34px 40px", color: "#ffffff",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px",
          boxShadow: "0 15px 35px rgba(192, 38, 211, 0.35)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.25)", padding: "10px", borderRadius: "14px", display: "flex" }}>
                <FaMusic size={28} />
              </div>
              <h1 style={{ margin: 0, fontSize: "30px", fontWeight: "900", letterSpacing: "-0.5px" }}>
                Annual College Functions & Fests
              </h1>
            </div>
            <p style={{ margin: "6px 0 0 50px", opacity: 0.95, fontSize: "14px", fontWeight: "500" }}>
              Celebrate Campus Life • Cultural Extravaganza, Hackathons & Concert Passes
            </p>
          </div>

          <button onClick={() => navigate('/dashboard')} style={{
            display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.4)", color: "#ffffff", padding: "12px 24px",
            borderRadius: "14px", cursor: "pointer", fontWeight: "700", backdropFilter: "blur(10px)"
          }}>
            <FaArrowLeft /> Dashboard
          </button>
        </div>

        {/* 🌟 Festival Highlight Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "18px" }}>
          <div style={{ background: themeStyles.cardBg, padding: "22px", borderRadius: "20px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase" }}>Festivals Scheduled</span>
              <FaStar color="#c026d3" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: "900", color: themeStyles.textPrimary }}>6 Major Fests</h2>
            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>● Season 2026 Active</span>
          </div>

          <div style={{ background: themeStyles.cardBg, padding: "22px", borderRadius: "20px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase" }}>Passes Reserved</span>
              <FaTicketAlt color="#7c3aed" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: "900", color: "#7c3aed" }}>2,500+ Passes</h2>
            <span style={{ fontSize: "11px", color: themeStyles.textSecondary, fontWeight: "600" }}>Free Student Entry</span>
          </div>

          <div style={{ background: themeStyles.cardBg, padding: "22px", borderRadius: "20px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase" }}>Stage Performances</span>
              <FaMicrophone color="#f43f5e" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: "900", color: "#f43f5e" }}>45+ Acts</h2>
            <span style={{ fontSize: "11px", color: "#f43f5e", fontWeight: "700" }}>Bands, Dance, Drama</span>
          </div>

          <div style={{ background: themeStyles.cardBg, padding: "22px", borderRadius: "20px", border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#a855f7", textTransform: "uppercase" }}>Prize & Cash Pool</span>
              <FaAward color="#eab308" size={18} />
            </div>
            <h2 style={{ margin: "8px 0 0 0", fontSize: "28px", fontWeight: "900", color: "#eab308" }}>₹3,00,000</h2>
            <span style={{ fontSize: "11px", color: "#eab308", fontWeight: "700" }}>Hackathon & Competitions</span>
          </div>
        </div>

        {/* Category Filter & Search Bar */}
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
                    ? "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)"
                    : (darkMode ? "#0f0b1e" : "#fdf4ff"),
                  color: selectedCategory === cat ? "#ffffff" : themeStyles.textSecondary,
                  boxShadow: selectedCategory === cat ? "0 4px 12px rgba(192, 38, 211, 0.35)" : "none"
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
              placeholder="Search fests & events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: "transparent", border: "none", outline: "none", color: themeStyles.textPrimary, fontSize: "13px", width: "100%" }}
            />
          </div>
        </div>

        {/* 🎭 Event Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(370px, 1fr))", gap: "26px" }}>
          {filteredEvents.map((item) => (
            <div
              key={item.id}
              style={{
                background: themeStyles.cardBg, borderRadius: "24px", overflow: "hidden",
                border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow,
                display: "flex", flexDirection: "column", transition: "transform 0.2s ease"
              }}
            >
              <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span style={{
                  position: "absolute", top: "14px", right: "14px",
                  background: item.status === "Open" ? "rgba(16, 185, 129, 0.9)" : "rgba(244, 63, 94, 0.9)",
                  color: "#ffffff", padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800",
                  backdropFilter: "blur(4px)"
                }}>
                  {item.status === "Open" ? "🟢 PASSES AVAILABLE" : "🔥 FAST FILLING"}
                </span>

                <span style={{
                  position: "absolute", bottom: "14px", left: "14px",
                  background: "rgba(0, 0, 0, 0.75)", color: "#ffffff", padding: "4px 10px",
                  borderRadius: "8px", fontSize: "11px", fontWeight: "700", backdropFilter: "blur(4px)"
                }}>
                  👥 {item.registeredCount}+ Registered
                </span>
              </div>

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  {item.title}
                </h3>

                <p style={{ margin: 0, fontSize: "13px", color: themeStyles.textSecondary, lineHeight: "1.5" }}>
                  {item.description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: themeStyles.textSecondary }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaClock color="#c026d3" /> <strong>When:</strong> {item.date}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaMapMarkerAlt color="#c026d3" /> <strong>Venue:</strong> {item.venue}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaStar color="#c026d3" /> <strong>Guest / Star:</strong> {item.chiefGuest}
                  </div>
                </div>

                <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: `1px solid ${themeStyles.cardBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#10b981" }}>FREE ENTRY PASS</span>
                  <button
                    onClick={() => setSelectedPassEvent(item)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px",
                      background: "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)", color: "white",
                      border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "12px", cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(192, 38, 211, 0.4)"
                    }}
                  >
                    <FaTicketAlt size={11} /> Get Entry Pass
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ⏰ Fest Timeline Schedule */}
        <div style={{
          background: themeStyles.cardBg, borderRadius: "24px", padding: "32px",
          border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary, display: "flex", alignItems: "center", gap: "10px" }}>
            <FaClock color="#c026d3" /> Grand Annual Day Stage Program Schedule
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <div style={{ background: darkMode ? "#0f0b1e" : "#fdf4ff", padding: "18px", borderRadius: "16px", border: `1px solid ${themeStyles.cardBorder}` }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#c026d3" }}>05:00 PM - 05:45 PM</span>
              <h4 style={{ margin: "6px 0 2px 0", fontSize: "15px", fontWeight: "800", color: themeStyles.textPrimary }}>Inauguration & Lamp Lighting</h4>
              <p style={{ margin: 0, fontSize: "12px", color: themeStyles.textSecondary }}>Welcome address by Principal & Dean</p>
            </div>

            <div style={{ background: darkMode ? "#0f0b1e" : "#fdf4ff", padding: "18px", borderRadius: "16px", border: `1px solid ${themeStyles.cardBorder}` }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#7c3aed" }}>06:00 PM - 07:30 PM</span>
              <h4 style={{ margin: "6px 0 2px 0", fontSize: "15px", fontWeight: "800", color: themeStyles.textPrimary }}>Inter-College Dance & Drama</h4>
              <p style={{ margin: 0, fontSize: "12px", color: themeStyles.textSecondary }}>12 Finalist Teams Live Showcase</p>
            </div>

            <div style={{ background: darkMode ? "#0f0b1e" : "#fdf4ff", padding: "18px", borderRadius: "16px", border: `1px solid ${themeStyles.cardBorder}` }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "#f43f5e" }}>08:00 PM - 10:30 PM</span>
              <h4 style={{ margin: "6px 0 2px 0", fontSize: "15px", fontWeight: "800", color: themeStyles.textPrimary }}>Celebrity Music & DJ Night 🔥</h4>
              <p style={{ margin: 0, fontSize: "12px", color: themeStyles.textSecondary }}>Star Band Concert & EDM Fiesta</p>
            </div>
          </div>
        </div>

      </div>

      {/* 🎟️ GET PASS BOOKING MODAL */}
      {selectedPassEvent && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: themeStyles.cardBg, borderRadius: "24px", padding: "34px", maxWidth: "500px", width: "92%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: `1px solid ${themeStyles.cardBorder}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: themeStyles.textPrimary }}>
                  Reserve Entry Pass
                </h3>
                <span style={{ fontSize: "12px", color: "#c026d3", fontWeight: "700" }}>{selectedPassEvent.title}</span>
              </div>
              <button onClick={() => setSelectedPassEvent(null)} style={{ background: "none", border: "none", color: themeStyles.textSecondary, cursor: "pointer", fontSize: "18px" }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleBookPass} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>STUDENT FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={bookingForm.studentName}
                  onChange={(e) => setBookingForm({ ...bookingForm, studentName: e.target.value })}
                  style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>ROLL NUMBER *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-101"
                    value={bookingForm.rollNo}
                    onChange={(e) => setBookingForm({ ...bookingForm, rollNo: e.target.value })}
                    style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "11px", fontWeight: "800", color: themeStyles.textSecondary }}>PASS TYPE</label>
                  <select
                    value={bookingForm.passType}
                    onChange={(e) => setBookingForm({ ...bookingForm, passType: e.target.value })}
                    style={{ padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${themeStyles.inputBorder}`, background: themeStyles.inputBg, color: themeStyles.textPrimary, outline: "none" }}
                  >
                    <option value="VIP Student Pass">VIP Student Pass</option>
                    <option value="General Entry Pass">General Entry Pass</option>
                    <option value="Stage Performer Pass">Stage Performer Pass</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setSelectedPassEvent(null)} style={{ padding: "10px 20px", borderRadius: "10px", border: `1px solid ${themeStyles.inputBorder}`, background: "none", color: themeStyles.textSecondary, fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 26px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)", color: "white", fontWeight: "800", cursor: "pointer", boxShadow: "0 6px 20px rgba(192, 38, 211, 0.4)" }}>Generate Pass</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🎟️ ISSUED DIGITAL EVENT PASS MODAL */}
      {issuedPass && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "24px", padding: "28px", maxWidth: "480px", width: "92%",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)", position: "relative"
          }}>
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "17px", fontWeight: "800" }}>Your Digital Event Pass</h3>
              <button onClick={() => setIssuedPass(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: "18px" }}>
                <FaTimes />
              </button>
            </div>

            {/* PRINTABLE EVENT PASS TICKET */}
            <div id="printable-event-pass" style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #4c0519 100%)",
              borderRadius: "20px", padding: "26px", color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)", border: "2px dashed #c084fc",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "12px", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#f472b6", fontWeight: "800" }}>OFFICIAL INVITATION PASS</span>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "16px", fontWeight: "900", color: "#ffffff" }}>{issuedPass.eventTitle}</h3>
                </div>
                <div style={{ background: "#f59e0b", color: "#000", fontWeight: "900", fontSize: "10px", padding: "3px 8px", borderRadius: "6px" }}>
                  {issuedPass.passType}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", marginBottom: "16px" }}>
                <div><span style={{ color: "#c084fc", fontSize: "10px" }}>ATTENDEE:</span><br/><strong>{issuedPass.studentName}</strong></div>
                <div><span style={{ color: "#c084fc", fontSize: "10px" }}>ROLL NUMBER:</span><br/><strong>{issuedPass.rollNo}</strong></div>
                <div><span style={{ color: "#c084fc", fontSize: "10px" }}>EVENT DATE:</span><br/><strong>{issuedPass.date}</strong></div>
                <div><span style={{ color: "#c084fc", fontSize: "10px" }}>PASS ID:</span><br/><strong>{issuedPass.passId}</strong></div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#4ade80" }}>✓ VERIFIED ADMISSION</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>Present this QR at Gate Entry</div>
                </div>
                <FaQrcode size={38} color="#ffffff" />
              </div>
            </div>

            <div className="no-print" style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)", color: "white",
                  border: "none", borderRadius: "12px", fontWeight: "800", cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(192, 38, 211, 0.4)"
                }}
              >
                <FaTicketAlt /> Print / Save Pass (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FunctionPage;