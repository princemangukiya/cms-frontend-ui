import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";

// Pages Imports
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

// Yahan aapko baaki components bhi import karne honge
import Student from "./pages/Student";
import Staff from "./pages/Staff";
import Course from "./pages/Course";
import Result from "./pages/Result";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Library from "./pages/Library";
import Exam from "./pages/Exam";
import BookIssue from "./pages/BookIssue";
import Feedback from "./pages/Feedback";
import Payment from "./pages/Payment";
import Holiday from "./pages/Holiday";
import CompanyPlacement from "./pages/CompanyPlacement";

function App() {
  return (
    <BrowserRouter>
      {/* ... baaki code same rahega ... */}
      <nav style={{ padding: '10px', background: '#f4f4f4', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard" style={{ marginLeft: '15px' }}>Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute><Student /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
        <Route path="/course" element={<ProtectedRoute><Course /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/exam" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/book-issue" element={<ProtectedRoute><BookIssue /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/holiday" element={<ProtectedRoute><Holiday /></ProtectedRoute>} />
        <Route path="/placement" element={<ProtectedRoute><CompanyPlacement /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;