// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { fetchPendingCompanies, approvePendingCompany, rejectPendingCompany, adminLogout } from '../services/adminApi';
import Loading from '../components/Loading'; // Re-use your loading component
import moment from 'moment'; // For formatting dates
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [pendingCompanies, setPendingCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // Track loading state per company
    const navigate = useNavigate();

    const loadPendingCompanies = async () => {
        setLoading(true);
        const data = await fetchPendingCompanies();
        if (data.success) {
            setPendingCompanies(data.pendingCompanies);
        } else {
             // Handle potential auth error, e.g., redirect to login
            if (!localStorage.getItem('adminToken')) {
                navigate('/admin/login');
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPendingCompanies();
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const handleApprove = async (id) => {
        setActionLoading(id); // Set loading for this specific company
        const result = await approvePendingCompany(id);
        if (result.success) {
            // Refresh the list after approval
            setPendingCompanies(prev => prev.filter(company => company._id !== id));
        }
        setActionLoading(null); // Reset loading state
    };

    const handleReject = async (id) => {
         setActionLoading(id); // Set loading for this specific company
        const result = await rejectPendingCompany(id);
        if (result.success) {
            // Refresh the list after rejection
            setPendingCompanies(prev => prev.filter(company => company._id !== id));
        }
         setActionLoading(null); // Reset loading state
    };

    const handleLogout = () => {
        adminLogout(); // Call logout from API service
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
                     <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                <h2 className="text-xl font-medium text-gray-700 mb-4">Pending Company Approvals</h2>

                {pendingCompanies.length === 0 ? (
                    <p className="text-gray-500">No companies are currently awaiting approval.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Website</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Domain</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIN</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {pendingCompanies.map((company) => (
                                    <tr key={company._id}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <img src={company.image} alt={`${company.name} logo`} className="w-10 h-10 rounded-full object-contain border" />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-medium">{company.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{company.email}</td>
                                        <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                                {company.website}
                                            </a>
                                        </td>
                                         <td className="px-4 py-3 whitespace-nowrap text-gray-600 hidden lg:table-cell">{company.domain}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">{company.cin}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs hidden lg:table-cell">{moment(company.submittedAt).format('lll')}</td>
                                        <td className="px-4 py-3 whitespace-nowrap space-x-2">
                                            <button
                                                onClick={() => handleApprove(company._id)}
                                                disabled={actionLoading === company._id}
                                                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 disabled:opacity-50"
                                            >
                                                {actionLoading === company._id ? 'Processing...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(company._id)}
                                                disabled={actionLoading === company._id}
                                                className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                                            >
                                                 {actionLoading === company._id ? 'Processing...' : 'Reject'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;