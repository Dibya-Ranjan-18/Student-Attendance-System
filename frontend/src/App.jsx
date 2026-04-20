import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ForgotPassword from './pages/ForgotPassword';
import LoadingOverlay from './components/LoadingOverlay';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { AnimatePresence, motion } from 'framer-motion';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const { setIsLoading } = useLoading();
  
  React.useEffect(() => {
    setIsLoading(loading);
  }, [loading, setIsLoading]);

  if (loading) return null; // Global loader will handle it
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { setIsLoading } = useLoading();

  React.useEffect(() => {
    setIsLoading(loading);
  }, [loading, setIsLoading]);

  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />;
  }
  
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} />;
};

function App() {
  return (
    <Router>
      <LoadingProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </LoadingProvider>
    </Router>
  );
}

const AppContent = () => {
  const { isLoading } = useLoading();
  const location = useLocation();

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      
      <LoadingOverlay isVisible={isLoading} />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <PageWrapper>
                  <Login />
                </PageWrapper>
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <PageWrapper>
                  <Register />
                </PageWrapper>
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <PageWrapper>
                  <ForgotPassword />
                </PageWrapper>
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRole="admin">
                <PageWrapper>
                  <AdminDashboard />
                </PageWrapper>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute allowedRole="student">
                <PageWrapper>
                  <StudentDashboard />
                </PageWrapper>
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, clipPath: 'inset(10% 0 10% 0)', scale: 1.02, filter: 'blur(10px)' }}
    animate={{ opacity: 1, clipPath: 'inset(0% 0 0% 0)', scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, clipPath: 'inset(10% 0 10% 0)', scale: 0.98, filter: 'blur(5px)' }}
    transition={{ 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1],
      opacity: { duration: 0.3 }
    }}
    className="min-h-screen overflow-hidden"
  >
    {children}
  </motion.div>
);

export default App;
