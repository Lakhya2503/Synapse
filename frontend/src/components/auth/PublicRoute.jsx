import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If user is authenticated, redirect to chat page
    if (user && token) {
        return <Navigate to="/synapse" replace />;
    }

    return children;
};

export default PublicRoute;
