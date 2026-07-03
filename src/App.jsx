
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";

// Imports...
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Student from "./pages/Student";
import Staff from "./pages/Staff";
import Course from "./pages/Course";
import Subject from "./pages/Subject";
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
import PlacementStudent from "./pages/PlacementStudent"; // Import added
import ClassMgmt from "./pages/ClassMgmt";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute><Student /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
        <Route path="/course" element={<ProtectedRoute><Course /></ProtectedRoute>} />
        <Route path="/subject" element={<ProtectedRoute><Subject /></ProtectedRoute>} />
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
        <Route path="/placement-student" element={<ProtectedRoute><PlacementStudent /></ProtectedRoute>} />
        <Route path="/class-mgmt" element={<ProtectedRoute><ClassMgmt /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;