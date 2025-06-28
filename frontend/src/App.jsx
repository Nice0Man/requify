import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requirements from './pages/Requirements';
import RequirementDetails from './pages/RequirementDetails';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Releases from './pages/Releases';
import ReleaseDetails from './pages/ReleaseDetails';
import Testing from './pages/Testing';
import TestDetails from './pages/TestDetails';
import Admin from './pages/Admin';
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="requirements" element={<Requirements />} />
            <Route path="requirements/:id" element={<RequirementDetails />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="releases" element={<Releases />} />
            <Route path="releases/:id" element={<ReleaseDetails />} />
            <Route path="testing" element={<Testing />} />
            <Route path="testing/:id" element={<TestDetails />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
};

export default App;
