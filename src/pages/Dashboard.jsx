import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaBookOpen,
  FaChartBar,
  FaClipboardCheck,
  FaTasks,
  FaRegCalendarAlt,
  FaUniversity,
  FaDollarSign,
  FaSuitcase,
  FaBuilding,
  FaMoneyBillWave,
  FaComments,
  FaTrophy,
  FaCamera,
  FaFolderOpen,
  FaEye,
  FaTimes,
  FaCheck,
  FaRedo,
  FaSignOutAlt,
  FaUserCog,
  FaBullhorn,
  FaShieldAlt
} from 'react-icons/fa';
import TopBar from "../components/TopBar";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const moduleConfig = {
  Student: { icon: FaUserGraduate, color: "#6366f1", bgLight: "#e0e7ff", bgDark: "rgba(99, 102, 241, 0.2)" },
  Staff: { icon: FaChalkboardTeacher, color: "#f59e0b", bgLight: "#fef3c7", bgDark: "rgba(245, 158, 11, 0.2)" },
  Course: { icon: FaBook, color: "#0284c7", bgLight: "#e0f2fe", bgDark: "rgba(2, 132, 199, 0.2)" },
  Subject: { icon: FaBookOpen, color: "#10b981", bgLight: "#d1fae5", bgDark: "rgba(16, 185, 129, 0.2)" },
  Result: { icon: FaChartBar, color: "#ec4899", bgLight: "#fce7f3", bgDark: "rgba(236, 72, 153, 0.2)" },
  Attendance: { icon: FaClipboardCheck, color: "#8b5cf6", bgLight: "#ede9fe", bgDark: "rgba(139, 92, 246, 0.2)" },
  "Book Issue": { icon: FaTasks, color: "#eab308", bgLight: "#fef9c3", bgDark: "rgba(234, 179, 8, 0.2)" },
  "Class Mgmt": { icon: FaUniversity, color: "#3b82f6", bgLight: "#dbeafe", bgDark: "rgba(59, 130, 246, 0.2)" },
  Exam: { icon: FaRegCalendarAlt, color: "#059669", bgLight: "#d1fae5", bgDark: "rgba(5, 150, 105, 0.2)" },
  Feedback: { icon: FaComments, color: "#f43f5e", bgLight: "#ffe4e6", bgDark: "rgba(244, 63, 94, 0.2)" },
  Fees: { icon: FaDollarSign, color: "#4f46e5", bgLight: "#e0e7ff", bgDark: "rgba(79, 70, 229, 0.2)" },
  Holiday: { icon: FaRegCalendarAlt, color: "#f97316", bgLight: "#ffedd5", bgDark: "rgba(249, 115, 22, 0.2)" },
  Library: { icon: FaBookOpen, color: "#06b6d4", bgLight: "#cffafe", bgDark: "rgba(6, 182, 1212, 0.2)" },
  Payment: { icon: FaMoneyBillWave, color: "#10b981", bgLight: "#d1fae5", bgDark: "rgba(16, 185, 129, 0.2)" },
  "Company Placement": { icon: FaBuilding, color: "#d946ef", bgLight: "#fae8ff", bgDark: "rgba(217, 70, 239, 0.2)" },
  "Placement Student": { icon: FaSuitcase, color: "#a855f7", bgLight: "#f3e8ff", bgDark: "rgba(168, 85, 247, 0.2)" },
};

function Dashboard() {
  const navigate = useNavigate();
  const themeContext = useTheme();

  const darkMode = themeContext?.darkMode ?? false;

  const [searchTerm, setSearchTerm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [roleId, setRoleId] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return Number(user?.role_id || user?.roleId || user?.role?.role_id || 4);
    } catch {
      return 4;
    }
  });
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  const getRoleName = (id) => {
    switch (Number(id)) {
      case 1: return "HOD";
      case 2: return "Principal";
      case 3: return "Professor";
      case 4: return "Student";
      case 5: return "Librarian";
      case 6: return "Placement Officer";
      default: return "User";
    }
  };

  const loadUserData = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const email = user?.emailId || user?.email_id || user?.email || "";
      setUserEmail(email);

      const currentRoleId = user?.role_id || user?.roleId || user?.role?.role_id || 4;
      setRoleId(Number(currentRoleId));

      if (user?.fullName && user.fullName.trim() !== '') {
        setDisplayName(user.fullName);
      } else if (user?.full_name && user.full_name.trim() !== '') {
        setDisplayName(user.full_name);
      } else if (email) {
        const rawName = email.split("@")[0];
        setDisplayName(rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase());
      } else {
        setDisplayName("User");
      }

      let savedImage = user?.profile_pic || user?.profilePic || localStorage.getItem("userProfilePic");

      if (savedImage && savedImage !== "NULL" && savedImage.trim().length > 0) {
        setProfileImage(savedImage);
      } else {
        setProfileImage(DEFAULT_AVATAR);
      }
    } catch (error) {
      console.error("Error loading user data in Dashboard:", error);
    }
  };

  useEffect(() => {
    loadUserData();
    window.addEventListener("profileUpdated", loadUserData);
    window.addEventListener("storage", loadUserData);

    return () => {
      window.removeEventListener("profileUpdated", loadUserData);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  // When clicking avatar or edit icon, open options modal (Browse or Camera)
  const handleAvatarClick = () => {
    setShowPhotoOptionsModal(true);
  };

  const handleOpenImageInBrowser = (e) => {
    e?.stopPropagation();

    if (!profileImage || profileImage === DEFAULT_AVATAR) {
      setShowPhotoOptionsModal(true);
      return;
    }

    try {
      if (profileImage.startsWith("data:image")) {
        const parts = profileImage.split(';base64,');
        const contentType = parts[0].replace('data:', '');
        const byteCharacters = window.atob(parts[1]);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(profileImage, '_blank');
      }
    } catch (err) {
      console.error("Could not open image in preview tab:", err);
      window.open(profileImage, '_blank');
    }
  };

  // Reusable function to save Base64 photo to Database & sync LocalStorage
  const saveProfilePicToDatabase = async (base64Image) => {
    setSavingPhoto(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user?.user_id || user?.userId || user?.id;

      if (!userId) {
        alert("User ID missing! Please login again.");
        return;
      }

      const token = localStorage.getItem("token") || localStorage.getItem("jwtToken") || localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      await axios.put(
        `http://localhost:8080/api/users/${userId}/update-profile-pic`,
        { profilePic: base64Image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setProfileImage(base64Image);
      localStorage.setItem("userProfilePic", base64Image);

      user.profile_pic = base64Image;
      user.profilePic = base64Image;
      localStorage.setItem("user", JSON.stringify(user));

      window.dispatchEvent(new Event("profileUpdated"));
      window.dispatchEvent(new Event("storage"));

      alert("Profile picture updated & saved in Database!");
    } catch (err) {
      console.error("Failed to save picture in Database:", err);
      alert("Database connection failed or unauthorized. Could not save photo.");
    } finally {
      setSavingPhoto(false);
    }
  };

  // Handle file selected from File Explorer
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        await saveProfilePicToDatabase(base64Image);
        setShowPhotoOptionsModal(false);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Start live webcam stream
  const handleStartCamera = async () => {
    setShowPhotoOptionsModal(false);
    setShowCameraModal(true);
    setCapturedPhoto(null);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access camera. Please ensure camera permissions are allowed in your browser settings."
      );
    }
  };

  // Stop camera and close modal
  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
    setCapturedPhoto(null);
    setCameraError(null);
  };

  // Capture still photo from video stream
  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      
      // Mirror the snapshot horizontally to match the webcam selfie preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPhoto(base64);

      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
  };

  // Retake photo: restart webcam
  const handleRetakePhoto = async () => {
    setCapturedPhoto(null);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn("Video play interrupted:", e));
      }
    } catch (err) {
      console.error("Camera retake error:", err);
      setCameraError("Could not restart camera. Please verify camera permissions.");
    }
  };

  // Attach camera stream to video whenever camera modal and stream are active
  useEffect(() => {
    if (showCameraModal && cameraStream && videoRef.current && !capturedPhoto) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(e => console.warn("Video play interrupted:", e));
    }
  }, [showCameraModal, cameraStream, capturedPhoto]);

  // Confirm captured photo and save to Database
  const handleConfirmCapturedPhoto = async () => {
    if (capturedPhoto) {
      await saveProfilePicToDatabase(capturedPhoto);
      handleStopCamera();
    }
  };

  // Ensure camera stream is stopped if component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const menuItems = [
    { name: "Student", path: "/student" },
    { name: "Staff", path: "/staff" },
    { name: "Course", path: "/course" },
    { name: "Subject", path: "/subject" },
    { name: "Result", path: "/result" },
    { name: "Attendance", path: "/attendance" },
    { name: "Book Issue", path: "/book-issue" },
    { name: "Class Mgmt", path: "/class-mgmt" },
    { name: "Exam", path: "/exam" },
    { name: "Feedback", path: "/feedback" },
    { name: "Fees", path: "/fees" },
    { name: "Holiday", path: "/holiday" },
    { name: "Library", path: "/library" },
    { name: "Payment", path: "/payment" },
    { name: "Company Placement", path: "/placement" },
    { name: "Placement Student", path: "/placement-student" },
  ];

  const getButtonText = (moduleName) => {
    // 💼 Role 6: Placement Officer Access Rules
    if (roleId === 6) {
      if (["Company Placement", "Placement Student"].includes(moduleName)) {
        return "Add Detail";
      }
      return "View Detail";
    }

    // 📚 Role 5: Librarian Access Rules
    if (roleId === 5) {
      if (["Library", "Book Issue"].includes(moduleName)) {
        return "Add Detail";
      }
      return "View Detail";
    }

    // 👨‍🏫 Role 3: Professor Access Rules
    if (roleId === 3) {
      if (["Fees", "Payment"].includes(moduleName)) {
        return "No Access";
      }
      if (["Attendance", "Feedback", "Result"].includes(moduleName)) {
        return "Add Detail";
      }
      return "View Detail";
    }

    // 👑 Role 2: Principal Access Rules
    if (roleId === 2) {
      if (["Result", "Book Issue", "Payment", "Library", "Company Placement", "Placement Student"].includes(moduleName)) {
        return "View Detail";
      }
      return "Add Detail";
    }

    // 👔 Role 1: HOD Access Rules
    if (roleId === 1) {
      if (moduleName === "Payment") {
        return "No Access";
      }
      const hodViewOnlyModules = ["Result", "Holiday", "Fees", "Book Issue", "Library", "Company Placement", "Placement Student"];
      if (hodViewOnlyModules.includes(moduleName)) {
        return "View Detail";
      }
      return "Add Detail";
    }

    // 🎓 Role 4: Student Access Rules
    if (roleId === 4) {
      if (moduleName === "Payment") return "Pay Detail";
      if (moduleName === "Feedback") return "Add Feedback";
      return "View Detail";
    }

    return "View Detail";
  };

  const filteredMenuItems = menuItems
    .filter((item) => {
      // 🔒 Librarian (Role 5) ko strictly sirf 2 modules dikhenge: Library & Book Issue
      if (roleId === 5) {
        return item.name === "Library" || item.name === "Book Issue";
      }
      // 💼 Placement Officer (Role 6) ko strictly sirf 2 modules dikhenge: Company Placement & Placement Student
      if (roleId === 6) {
        return item.name === "Company Placement" || item.name === "Placement Student";
      }
      // 🏛️ HOD (Role 1) login hone par Payment module completely remove / hide rahega (show hi nahi hona chahiye)
      if (roleId === 1 && item.name === "Payment") {
        return false;
      }
      // 👨‍🏫 Professor (Role 3) has authority over Students: NO access to Staff, Class Mgmt, Fees, and Payment
      if (roleId === 3 && (item.name === "Staff" || item.name === "Class Mgmt" || item.name === "Fees" || item.name === "Payment")) {
        return false;
      }
      // 🔒 Student (Role 4) has NO access to Staff, Class Mgmt, and Book Issue
      if (roleId === 4 && (item.name === "Staff" || item.name === "Class Mgmt" || item.name === "Book Issue")) {
        return false;
      }
      return true;
    })
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userProfilePic");
    navigate("/");
  };

  const themeStyles = {
    bgMain: darkMode
      ? "radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 40%, #020617 100%)"
      : "radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 40%, #f1f5f9 100%)",
    textPrimary: darkMode ? "#f8fafc" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    sidebarBg: darkMode ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.85)",
    sidebarBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(226, 232, 240, 0.8)",
    profileBg: darkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.8)",
    profileBorder: darkMode ? "rgba(255, 255, 255, 0.12)" : "rgba(203, 213, 225, 0.6)",
    cardBg: darkMode ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.85)",
    cardBorder: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.9)",
    cardShadow: darkMode ? "0 20px 40px -15px rgba(0, 0, 0, 0.5)" : "0 15px 35px -10px rgba(0, 0, 0, 0.05)",
    navBtnBg: darkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(241, 245, 249, 0.8)",
    navBtnText: darkMode ? "#cbd5e1" : "#475569"
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      width: "100vw",
      background: themeStyles.bgMain,
      color: themeStyles.textPrimary,
      margin: 0,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      transition: "background 0.4s ease, color 0.4s ease"
    }}>
      {/* Sidebar Area */}
      <div style={{
        width: "290px",
        background: themeStyles.sidebarBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: themeStyles.textPrimary,
        padding: "28px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        borderRight: `1px solid ${themeStyles.sidebarBorder}`,
        boxShadow: "10px 0 30px rgba(0, 0, 0, 0.04)",
        boxSizing: "border-box",
        transition: "all 0.3s ease",
        zIndex: 20
      }}>
        {/* Brand Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          paddingBottom: "18px",
          borderBottom: `1px solid ${themeStyles.profileBorder}`
        }}>
          <div style={{
            width: "42px",
            height: "42px",
            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 8px 18px rgba(99, 102, 241, 0.35)",
            flexShrink: 0
          }}>
            <FaUserGraduate size={22} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 style={{
              fontSize: "20px",
              margin: 0,
              fontWeight: "800",
              letterSpacing: "-0.5px",
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              CMS Portal
            </h2>
            <span style={{
              fontSize: "11px",
              fontWeight: "700",
              color: themeStyles.textSecondary,
              letterSpacing: "0.5px",
              marginTop: "2px"
            }}>
              Academic ERP System
            </span>
          </div>
        </div>

        {/* Circular DP Profile Section (Directly under CMS Portal) */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "16px 12px 14px 12px",
          borderRadius: "20px",
          background: themeStyles.profileBg,
          border: `1px solid ${themeStyles.profileBorder}`,
          boxShadow: darkMode ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 16px rgba(0,0,0,0.03)",
          transition: "all 0.3s ease"
        }}>
          {/* Circular DP Avatar */}
          <div
            onClick={handleAvatarClick}
            title="Click to view or change profile photo"
            style={{
              position: "relative",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              cursor: "pointer",
              padding: "3px",
              background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
              boxShadow: "0 8px 22px rgba(99, 102, 241, 0.35)",
              transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: darkMode ? "#0f172a" : "#ffffff",
              position: "relative"
            }}>
              <img
                src={profileImage}
                alt={displayName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
              {/* Camera Hover Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(15, 23, 42, 0.65)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.2s ease"
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseOut={(e) => (e.currentTarget.style.opacity = 0)}
              >
                <FaCamera size={18} />
              </div>
            </div>

            {/* Online Active Dot */}
            <span
              style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                width: "13px",
                height: "13px",
                backgroundColor: "#10b981",
                border: `2.5px solid ${themeStyles.sidebarBg}`,
                borderRadius: "50%",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
              }}
              title="Active • Online"
            />
          </div>

          {/* User Name (ONLY Name, NO Student) */}
          <div
            onClick={() => navigate("/profile")}
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: themeStyles.textPrimary,
              marginTop: "10px",
              cursor: "pointer",
              letterSpacing: "-0.2px",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              transition: "color 0.2s ease"
            }}
            onMouseOver={(e) => (e.target.style.color = "#6366f1")}
            onMouseOut={(e) => (e.target.style.color = themeStyles.textPrimary)}
            title="Click to manage profile"
          >
            {displayName}
          </div>

          {/* Sleek Modern Log Out Button directly under Name */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              marginTop: "10px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "7px 22px",
              borderRadius: "20px",
              background: darkMode
                ? "rgba(239, 68, 68, 0.12)"
                : "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.28)",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "0.3px",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.06)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(239, 68, 68, 0.35)";
              e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = darkMode ? "rgba(239, 68, 68, 0.12)" : "rgba(239, 68, 68, 0.08)";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.28)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(239, 68, 68, 0.06)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }}
            title="Log Out of CMS"
          >
            <FaSignOutAlt size={12} /> Log Out
          </button>
        </div>

        {/* Hidden File Input for photo uploads */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          style={{ display: "none" }}
        />

        {/* Navigation Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto" }}>
          <div style={{
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "1px",
            color: themeStyles.textSecondary,
            padding: "0 8px 8px 8px"
          }}>
            MAIN NAVIGATION
          </div>

          <div
            style={{
              cursor: "pointer",
              fontSize: "14px",
              color: "#ffffff",
              padding: "12px 16px",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              borderRadius: "14px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.35)",
              transition: "transform 0.2s ease"
            }}
            onClick={() => navigate("/dashboard")}
          >
            <FaChartBar size={16} /> Home Dashboard
          </div>

          {/* Non-Librarians & Non-Placement: Sports & Function */}
          {roleId !== 5 && roleId !== 6 && (
            <>
              <div
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: themeStyles.navBtnText,
                  padding: "12px 16px",
                  background: themeStyles.navBtnBg,
                  border: `1px solid ${themeStyles.profileBorder}`,
                  borderRadius: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.25s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = themeStyles.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = themeStyles.navBtnText;
                }}
                onClick={() => navigate("/sports")}
              >
                <FaTrophy size={16} color="#f59e0b" /> Sports & Athletics
              </div>

              <div
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: themeStyles.navBtnText,
                  padding: "12px 16px",
                  background: themeStyles.navBtnBg,
                  border: `1px solid ${themeStyles.profileBorder}`,
                  borderRadius: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.25s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = themeStyles.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = themeStyles.navBtnText;
                }}
                onClick={() => navigate("/function")}
              >
                <FaRegCalendarAlt size={16} color="#ec4899" /> College Functions
              </div>

              <div
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: themeStyles.navBtnText,
                  padding: "12px 16px",
                  background: themeStyles.navBtnBg,
                  border: `1px solid ${themeStyles.profileBorder}`,
                  borderRadius: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.25s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = themeStyles.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = themeStyles.navBtnText;
                }}
                onClick={() => navigate("/notice-board")}
              >
                <FaBullhorn size={16} color="#ea580c" /> Circulars & Notices
              </div>
            </>
          )}

          {/* Librarian (Role 5) */}
          {roleId === 5 && (
            <>
              <div
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: themeStyles.navBtnText,
                  padding: "12px 16px",
                  background: themeStyles.navBtnBg,
                  border: `1px solid ${themeStyles.profileBorder}`,
                  borderRadius: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.25s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = themeStyles.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = themeStyles.navBtnText;
                }}
                onClick={() => navigate("/library")}
              >
                <FaBookOpen size={16} color="#06b6d4" /> Library
              </div>

              <div
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: themeStyles.navBtnText,
                  padding: "12px 16px",
                  background: themeStyles.navBtnBg,
                  border: `1px solid ${themeStyles.profileBorder}`,
                  borderRadius: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.25s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = themeStyles.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = themeStyles.navBtnText;
                }}
                onClick={() => navigate("/book-issue")}
              >
                <FaTasks size={16} color="#eab308" /> Book Issue Desk
              </div>
            </>
          )}

          {/* Placement Officer (Role 6) */}
          {roleId === 6 && (
            <>
              <div
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: themeStyles.navBtnText,
                  padding: "12px 16px",
                  background: themeStyles.navBtnBg,
                  border: `1px solid ${themeStyles.profileBorder}`,
                  borderRadius: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.25s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = themeStyles.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = themeStyles.navBtnText;
                }}
                onClick={() => navigate("/placement")}
              >
                <FaBuilding size={16} color="#d946ef" /> Company Detail
              </div>

              <div
                style={{
                  cursor: "pointer",
                  fontSize: "14px",
                  color: themeStyles.navBtnText,
                  padding: "12px 16px",
                  background: themeStyles.navBtnBg,
                  border: `1px solid ${themeStyles.profileBorder}`,
                  borderRadius: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.25s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.color = themeStyles.textPrimary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.color = themeStyles.navBtnText;
                }}
                onClick={() => navigate("/placement-student")}
              >
                <FaSuitcase size={16} color="#a855f7" /> Placement Student
              </div>
            </>
          )}

        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: "32px 44px", overflowY: "auto", zIndex: 10 }}>
        <TopBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenPhotoOptions={() => setShowPhotoOptionsModal(true)}
          onOpenImageInBrowser={handleOpenImageInBrowser}
        />

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "32px 0 28px 0"
        }}>
          <div style={{
            fontSize: "28px",
            fontWeight: "800",
            color: themeStyles.textPrimary,
            letterSpacing: "-0.8px"
          }}>
            Dashboard Overview
          </div>

          {roleId === 2 && (
            <div style={{
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              👑 Principal Section
            </div>
          )}

          {roleId === 1 && (
            <div style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              👔 HOD Section
            </div>
          )}

          {roleId === 4 && (
            <div style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              🎓 Student Section
            </div>
          )}

          {roleId === 3 && (
            <div style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              👨‍🏫 Professor Section
            </div>
          )}
{roleId === 5 && (
            <div style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              Librarian Section
            </div>
          )}

          {roleId === 6 && (
                      <div style={{
                        background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                        color: "#ffffff",
                        padding: "8px 16px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "700",
                        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        Placement Section
                      </div>
                    )}

        </div>


        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "26px"
        }}>
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => {
              const config = moduleConfig[item.name] || moduleConfig.Student;
              const IconComponent = config.icon;
              const cardIconBg = darkMode ? config.bgDark : config.bgLight;
              const btnText = getButtonText(item.name);
              const isViewOnly = btnText === "View Detail";

              return (
                <div
                  key={item.name}
                  style={{
                    background: themeStyles.cardBg,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    padding: "30px 24px 24px 24px",
                    borderRadius: "26px",
                    boxShadow: themeStyles.cardShadow,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "center",
                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                    border: `1px solid ${themeStyles.cardBorder}`,
                    boxSizing: "border-box",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                    e.currentTarget.style.borderColor = config.color;
                    e.currentTarget.style.boxShadow = `0 20px 40px -10px ${config.color}35`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.borderColor = themeStyles.cardBorder;
                    e.currentTarget.style.boxShadow = themeStyles.cardShadow;
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "-30px",
                    right: "-30px",
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    background: config.color,
                    filter: "blur(40px)",
                    opacity: darkMode ? 0.3 : 0.15,
                    pointerEvents: "none"
                  }} />

                  {isViewOnly && (
                    <span style={{
                      position: "absolute",
                      top: "12px",
                      right: "14px",
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "rgba(2, 132, 199, 0.15)",
                      color: "#0284c7",
                      border: "1px solid rgba(2, 132, 199, 0.3)"
                    }}>
                      👁️ View Only
                    </span>
                  )}

                  <div style={{
                    background: cardIconBg,
                    padding: "20px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                    boxShadow: `0 8px 20px ${config.color}25`
                  }}>
                    <IconComponent size={30} color={config.color} />
                  </div>

                  <h3 style={{ margin: "0 0 22px 0", fontSize: "19px", fontWeight: "800", color: themeStyles.textPrimary, letterSpacing: "-0.3px" }}>
                    {item.name}
                  </h3>

                  <button
                    disabled={btnText === "No Access"}
                    onClick={() => {
                      if (btnText !== "No Access") {
                        navigate(item.path);
                      }
                    }}
                    style={{
                      background: btnText === "No Access"
                        ? "#94a3b8"
                        : isViewOnly
                        ? "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)"
                        : `linear-gradient(135deg, ${config.color} 0%, #a855f7 100%)`,
                      color: "white",
                      border: "none",
                      padding: "12px 18px",
                      borderRadius: "16px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: btnText === "No Access" ? "not-allowed" : "pointer",
                      width: "100%",
                      boxShadow: btnText === "No Access" ? "none" : `0 8px 18px ${config.color}35`,
                      transition: "all 0.3s ease",
                      opacity: btnText === "No Access" ? 0.7 : 1
                    }}
                    onMouseOver={(e) => {
                      if (btnText !== "No Access") e.currentTarget.style.opacity = "0.9";
                    }}
                    onMouseOut={(e) => {
                      if (btnText !== "No Access") e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {btnText}
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: themeStyles.textSecondary, fontSize: "16px", fontWeight: "600" }}>
              No matching modules found for "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* 1. Photo Options Modal (Browse vs Camera vs View) */}
      {showPhotoOptionsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
          onClick={() => setShowPhotoOptionsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode ? "#1e293b" : "#ffffff",
              color: themeStyles.textPrimary,
              borderRadius: "24px",
              padding: "28px 24px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
              position: "relative"
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPhotoOptionsModal(false)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                background: darkMode ? "#334155" : "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: themeStyles.textSecondary,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
            >
              <FaTimes size={16} />
            </button>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  boxShadow: "0 8px 18px rgba(99, 102, 241, 0.35)"
                }}
              >
                <FaCamera size={26} />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: themeStyles.textPrimary }}>
                Profile Photo Options
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: themeStyles.textSecondary }}>
                Choose an option to update or view your picture
              </p>
            </div>

            {/* Options List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Option 1: Browse / Upload from Computer */}
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  border: darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  color: themeStyles.textPrimary,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(99, 102, 241, 0.15)",
                    color: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <FaFolderOpen size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>Upload from Computer</div>
                  <div style={{ fontSize: "12px", color: themeStyles.textSecondary, marginTop: "2px" }}>
                    Select image file (JPG, PNG, WebP up to 2MB)
                  </div>
                </div>
              </button>

              {/* Option 2: Live Camera Capture */}
              <button
                type="button"
                onClick={handleStartCamera}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  border: darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  color: themeStyles.textPrimary,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#ec4899";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(236, 72, 153, 0.15)",
                    color: "#ec4899",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <FaCamera size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>Take Photo with Camera</div>
                  <div style={{ fontSize: "12px", color: themeStyles.textSecondary, marginTop: "2px" }}>
                    Capture directly using your device webcam
                  </div>
                </div>
              </button>

              {/* Option 3: View Full Image in New Tab */}
              <button
                type="button"
                onClick={(e) => {
                  setShowPhotoOptionsModal(false);
                  handleOpenImageInBrowser(e);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "14px 18px",
                  borderRadius: "16px",
                  border: darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                  background: darkMode ? "#0f172a" : "#f8fafc",
                  color: themeStyles.textPrimary,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#10b981";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = darkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <FaEye size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>View Current Photo</div>
                  <div style={{ fontSize: "12px", color: themeStyles.textSecondary, marginTop: "2px" }}>
                    Open current photo in a new browser tab
                  </div>
                </div>
              </button>
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setShowPhotoOptionsModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: themeStyles.textSecondary,
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "8px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Camera Modal */}
      {showCameraModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
          onClick={handleStopCamera}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode ? "#1e293b" : "#ffffff",
              color: themeStyles.textPrimary,
              borderRadius: "24px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
              position: "relative"
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <FaCamera size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>
                  {capturedPhoto ? "Photo Preview" : "Take Live Photo"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleStopCamera}
                disabled={savingPhoto}
                style={{
                  background: darkMode ? "#334155" : "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: themeStyles.textSecondary,
                  cursor: savingPhoto ? "not-allowed" : "pointer"
                }}
              >
                <FaTimes size={15} />
              </button>
            </div>

            {/* Error state */}
            {cameraError ? (
              <div
                style={{
                  padding: "24px",
                  borderRadius: "16px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#ef4444",
                  textAlign: "center",
                  margin: "12px 0 20px"
                }}
              >
                <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "600" }}>
                  {cameraError}
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    style={{
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    style={{
                      background: darkMode ? "#334155" : "#e2e8f0",
                      color: themeStyles.textPrimary,
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Video Preview or Captured Photo */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "320px",
                    borderRadius: "18px",
                    overflow: "hidden",
                    backgroundColor: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
                  }}
                >
                  {capturedPhoto ? (
                    <img
                      src={capturedPhoto}
                      alt="Captured snapshot"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scaleX(-1)"
                      }}
                    />
                  )}

                  {/* Saving Overlay */}
                  {savingPhoto && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.75)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        gap: "12px",
                        zIndex: 10
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          border: "3px solid rgba(255, 255, 255, 0.3)",
                          borderTopColor: "#6366f1",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }}
                      />
                      <span style={{ fontSize: "14px", fontWeight: "700" }}>
                        Saving to Database...
                      </span>
                    </div>
                  )}
                </div>

                {/* Control Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "20px",
                    justifyContent: "center"
                  }}
                >
                  {!capturedPhoto ? (
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      disabled={savingPhoto || !cameraStream}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                        color: "#ffffff",
                        border: "none",
                        padding: "14px 24px",
                        borderRadius: "14px",
                        fontSize: "15px",
                        fontWeight: "700",
                        cursor: (!cameraStream || savingPhoto) ? "not-allowed" : "pointer",
                        boxShadow: "0 8px 20px rgba(99, 102, 241, 0.35)",
                        transition: "all 0.2s ease",
                        opacity: (!cameraStream || savingPhoto) ? 0.6 : 1
                      }}
                    >
                      <FaCamera size={18} />
                      Capture Photo
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleRetakePhoto}
                        disabled={savingPhoto}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          background: darkMode ? "#334155" : "#f1f5f9",
                          color: themeStyles.textPrimary,
                          border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
                          padding: "14px 20px",
                          borderRadius: "14px",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: savingPhoto ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <FaRedo size={15} />
                        Retake
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmCapturedPhoto}
                        disabled={savingPhoto}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "#ffffff",
                          border: "none",
                          padding: "14px 20px",
                          borderRadius: "14px",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: savingPhoto ? "not-allowed" : "pointer",
                          boxShadow: "0 8px 20px rgba(16, 185, 129, 0.35)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <FaCheck size={16} />
                        {savingPhoto ? "Saving..." : "Use This Photo"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;