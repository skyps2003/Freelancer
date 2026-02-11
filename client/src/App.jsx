import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthContext from './context/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import FreelancerDashboard from './pages/FreelancerDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Chat from './pages/Chat';

import Checkout from './pages/Checkout';

// Protected Route Component
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    // If loading, maybe show spinner. For now, simple null or spinner.
    if (loading && !isAuthenticated) {
        // Small Loading Spinner
        return <div className="min-h-screen bg-main flex items-center justify-center text-primary">Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Auth />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                    <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                    <Route path="/dashboard/freelancer" element={<PrivateRoute><FreelancerDashboard /></PrivateRoute>} />
                    <Route path="/dashboard/company" element={<PrivateRoute><CompanyDashboard /></PrivateRoute>} />
                    <Route
                        path="/upload"
                        element={
                            <PrivateRoute>
                                <Upload />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
