// src/components/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
    const adminToken = localStorage.getItem('adminToken'); // Check if admin token exists

    // If token exists, render the child routes (Outlet), otherwise redirect to admin login
    return adminToken ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;