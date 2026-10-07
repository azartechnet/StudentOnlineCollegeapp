import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import TestList from './pages/TestList.jsx';
import StudentTest from './pages/StudentTest.jsx';
import StudentResult from './pages/StudentResult.jsx';
import TrainerDashboard from './pages/TrainerDashboard.jsx';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/tests"
              element={
                <PrivateRoute role="student">
                  <TestList />
                </PrivateRoute>
              }
            />
            <Route
              path="/test/:testId"
              element={
                <PrivateRoute role="student">
                  <StudentTest />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-result"
              element={
                <PrivateRoute role="student">
                  <StudentResult />
                </PrivateRoute>
              }
            />
            <Route
              path="/trainer"
              element={
                <PrivateRoute role="trainer">
                  <TrainerDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}