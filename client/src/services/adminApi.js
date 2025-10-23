// src/services/adminApi.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Get backend URL from context or directly (adjust as needed)
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// IMPORTANT: Replace this with your actual admin authentication token handling
// For now, we'll assume a token is stored in localStorage after admin login
const getAdminAuthHeaders = () => {
    const adminToken = localStorage.getItem('adminToken'); // Example token storage
    if (!adminToken) {
        toast.error("Admin authentication required.");
        // Optional: Redirect to admin login
        // window.location.href = '/admin/login';
        return null;
    }
    // Adjust header key based on your admin auth middleware (e.g., 'Authorization': `Bearer ${adminToken}`)
    return { 'admin-token': adminToken }; // Example header
};

// Fetch all pending companies
export const fetchPendingCompanies = async () => {
    const headers = getAdminAuthHeaders();
    if (!headers) return { success: false, pendingCompanies: [] }; // Return empty on auth error

    try {
        const { data } = await axios.get(`${backendUrl}/api/admin/pending-companies`, { headers });
        if (data.success) {
            return data;
        } else {
            toast.error(data.message || "Failed to fetch pending companies.");
            return { success: false, pendingCompanies: [] };
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Error fetching data.");
        return { success: false, pendingCompanies: [] };
    }
};

// Approve a specific company
export const approvePendingCompany = async (pendingId) => {
    const headers = getAdminAuthHeaders();
    if (!headers) return { success: false };

    try {
        const { data } = await axios.post(`${backendUrl}/api/admin/approve-company/${pendingId}`, {}, { headers });
        if (data.success) {
            toast.success(data.message || "Company approved successfully!");
            return data;
        } else {
            toast.error(data.message || "Failed to approve company.");
            return { success: false };
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Error approving company.");
        return { success: false };
    }
};

// Reject a specific company
export const rejectPendingCompany = async (pendingId) => {
    const headers = getAdminAuthHeaders();
    if (!headers) return { success: false };

    try {
        const { data } = await axios.post(`${backendUrl}/api/admin/reject-company/${pendingId}`, {}, { headers });
         if (data.success) {
            toast.warn(data.message || "Company rejected successfully."); // Use warn for rejection
            return data;
        } else {
            toast.error(data.message || "Failed to reject company.");
            return { success: false };
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Error rejecting company.");
        return { success: false };
    }
};

// --- Add Admin Login API Call (Example) ---
// You'll need a backend endpoint like POST /api/admin/login
export const adminLogin = async (email, password) => {
    try {
        // Replace with your actual admin login endpoint and payload
        const { data } = await axios.post(`${backendUrl}/api/admin/login`, { email, password });
        if (data.success && data.token) {
            localStorage.setItem('adminToken', data.token); // Store token
            toast.success("Admin login successful!");
            return { success: true };
        } else {
            toast.error(data.message || "Admin login failed.");
            return { success: false };
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Admin login error.");
        return { success: false };
    }
};

export const adminLogout = () => {
    localStorage.removeItem('adminToken');
    // Optional: Redirect to login
    window.location.href = '/admin/login';
}
// ------------------------------------------