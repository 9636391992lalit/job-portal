
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const CompanyProtectedRoute = () => {
  const { companyToken } = useContext(AppContext);

 // If no token, redirect to home page.
 // You could also open the login modal, but redirect is cleaner.
 return companyToken ? <Outlet /> : <Navigate to="/" replace />;
};

export default CompanyProtectedRoute;