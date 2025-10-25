import React, { useContext, useEffect, useState, useRef } from 'react';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loading from '../components/Loading';

const ViewApplications = () => {
    const { backendUrl, companyToken } = useContext(AppContext);
    const [applicants, setApplicants] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null); // Ref for click outside detection

    // Fetch applications
    const fetchCompanyJobApplications = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/company/applicants', { headers: { token: companyToken } });
            setApplicants(Array.isArray(data.applications) ? data.applications.reverse() : []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch applications");
            setApplicants([]);
        }
    };

    // Change application status
    const changeJobApplicationStatus = async (id, status) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/company/change-status', { id, status }, { headers: { token: companyToken } });
            if (data.success) {
                toast.success(`Application ${status.toLowerCase()} successfully`);
                fetchCompanyJobApplications();
                setOpenMenuId(null); // Close menu
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change status");
        }
    };

    // Toggle dropdown menu
    const toggleMenu = (applicantId) => {
        setOpenMenuId(prevId => (prevId === applicantId ? null : applicantId));
    };

    // Effect to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check ref exists, click is outside, and not on the toggle button itself
            if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('button[title="Actions"]')) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => { // Cleanup listener
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    // Initial data fetch
    useEffect(() => {
        if (companyToken) {
            fetchCompanyJobApplications();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyToken]);

    // Loading state
    if (applicants === null) return <Loading />;

    // No applications state
    if (applicants.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center h-[70vh] gap-4'>
                <img src={assets.empty_icon} alt="No applications" className='w-32 h-32 opacity-50' />
                <p className='text-xl sm:text-2xl text-gray-500'>No Applications Available</p>
            </div>
        );
    }

    // Render table
    return (
        <div className='container mx-auto p-4'>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Job Applications</h2>
            <div className="overflow-x-auto rounded-lg shadow">
                <table className='w-full min-w-[700px] bg-white border border-gray-200 text-sm'>
                    <thead className="bg-gray-50">
                        <tr className='border-b'>
                            <th className='py-3 px-4 text-left font-medium text-gray-600'>#</th>
                            <th className='py-3 px-4 text-left font-medium text-gray-600'>Applicant</th>
                            <th className='py-3 px-4 text-left font-medium text-gray-600'>Job Title</th>
                            <th className='py-3 px-4 text-left font-medium text-gray-600'>Resume & Profile</th>
                            <th className='py-3 px-4 text-center font-medium text-gray-600'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.filter(item => item.jobId && item.userId).map((applicant, index) => (
                            <tr key={applicant._id || index} className='text-gray-700 hover:bg-gray-50 transition-colors'>
                                {/* Index */}
                                <td className='py-3 px-4 border-b text-gray-600'>{index + 1}</td>

                                {/* Applicant */}
                                <td className='py-3 px-4 border-b'>
                                    <div className='flex items-center gap-3'>
                                        <img
                                            className='w-10 h-10 rounded-full object-cover border-2 border-gray-200'
                                            src={applicant.userId.image || assets.placeholder_icon}
                                            alt={applicant.userId.name}
                                        />
                                        <div>
                                            <div className='font-medium text-gray-800'>{applicant.userId.name}</div>
                                            <div className='text-xs text-gray-500'>{applicant.userId.email}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Job Title */}
                                <td className='py-3 px-4 border-b font-medium text-gray-800'>
                                    {applicant.jobId.title}
                                </td>

                                {/* Resume & Profile */}
                                <td className='py-3 px-4 border-b whitespace-nowrap'>
                                    {applicant.userId.resume ? (
                                        <a
                                            href={applicant.userId.resume} target="blank"  // Inline display flag
                                            
                                            rel="noopener noreferrer"
                                            className='bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md inline-flex gap-2 items-center hover:bg-blue-100 transition-colors mr-2 text-xs font-medium'
                                            title="View Resume"
                                        >
                                            <img src={assets.resume_download_icon} alt="resume" className='w-4 h-4' /> Resume
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-xs mr-2">(No Resume)</span>
                                    )}
                                    <Link
                                        to={`/applicant/${applicant.userId._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md inline-flex gap-2 items-center hover:bg-gray-200 transition-colors text-xs font-medium'
                                        title="View Applicant Profile"
                                    >
                                        <img src={assets.person_icon} alt="profile" className='w-4 h-4' /> Profile
                                    </Link>
                                </td>

                                {/* ACTION CELL */}
                                <td className='py-3 px-4 border-b text-center'>
                                    {applicant.status === "Pending" ? (
                                        <div className='relative inline-block text-left' ref={openMenuId === applicant._id ? menuRef : null}>
                                            <button
                                                onClick={() => toggleMenu(applicant._id)}
                                                className='text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-bold px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors'
                                                title="Actions"
                                            >
                                                ⋮ {/* Vertical ellipsis */}
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openMenuId === applicant._id && (
                                                <div className='absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-50'>
                                                    <button
                                                        onClick={() => changeJobApplicationStatus(applicant._id, 'Accepted')}
                                                        className='block w-full text-left px-4 py-2 text-green-600 hover:bg-green-50 transition-colors text-sm font-medium rounded-t-md'
                                                    >
                                                        ✓ Accept
                                                    </button>
                                                    <button
                                                        onClick={() => changeJobApplicationStatus(applicant._id, 'Rejected')}
                                                        className='block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium rounded-b-md'
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            applicant.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                                            applicant.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700' // Default/Other status style
                                        }`}>
                                            {applicant.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewApplications;