// src/pages/CompanyProfile.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import JobCard from '../components/JobCard';
import { assets } from '../assets/assets'; 

const CompanyProfile = () => {
    const { id } = useParams();
    const { backendUrl } = useContext(AppContext);
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // This API call now returns the new fields (description, etc.)
                const { data } = await axios.get(`${backendUrl}/api/company/public/${id}`);
                if (data.success) {
                    setCompany(data.company);
                    setJobs(data.jobs);
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to fetch company profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, backendUrl]);

    // Helper component for displaying company details in the sidebar
    const DetailItem = ({ icon, title, value }) => {
        // Don't render if value is empty or null
        if (!value) return null; 
        return (
            <div className='flex items-start gap-3'>
                <img src={icon} alt={title} className='w-5 h-5 mt-1 opacity-70' />
                <div>
                    <p className='text-gray-600 text-sm'>{title}</p>
                    <p className='text-gray-800 font-medium'>{value}</p>
                </div>
            </div>
        );
    };

    if (loading) {
        return <Loading />;
    }

    if (!company) {
        return (
            <>
                <Navbar />
                <div className='container 2xl:px-20 mx-auto min-h-[70vh] my-10 px-4 text-center'>
                    <h2 className='text-3xl font-semibold mb-8'>Company Not Found</h2>
                    <Link to="/" className='text-blue-600'>Go back home</Link>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className='container 2xl:px-20 mx-auto min-h-[70vh] my-10 px-4'>
                
                {/* --- Main Content Area (Two Columns) --- */}
                <div className='flex flex-col lg:flex-row gap-10'>

                    {/* --- Left Column (Header & Jobs) --- */}
                    <div className='w-full lg:w-2/3'>
                        
                        {/* --- Company Header --- */}
                        <div className='flex flex-col sm:flex-row items-center gap-6 p-8 bg-gray-50 rounded-lg mb-8'>
                            <img 
                                src={company.image} 
                                alt={`${company.name} logo`} 
                                className='w-24 h-24 rounded-full border-4 border-white shadow-md' 
                            />
                            <div>
                                <h1 className='text-3xl font-bold'>{company.name}</h1>
                                <a 
                                    href={company.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className='text-blue-600 hover:underline flex items-center gap-1 mt-1'
                                >
                                    Visit Website 
                                    {/* Use an icon from your assets */}
                                    <img src={assets.resume_download_icon} alt="external link" className='w-4 h-4' /> 
                                </a>
                            </div>
                        </div>

                        {/* --- NEW: About the Company Section --- */}
                        {/* This section will only appear if the company has added a description */}
                        {company.description && (
                            <div className='mb-8'>
                                <h2 className='text-2xl font-semibold mb-3'>About {company.name}</h2>
                                {/* We use whitespace-pre-line to respect newlines in the description */}
                                <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                                    {company.description}
                                </p>
                            </div>
                        )}

                        {/* --- Job Listings --- */}
                        <div>
                            <h2 className='text-2xl font-semibold mb-4'>Current Openings ({jobs.length})</h2>
                            {jobs.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {jobs.map(job => (
                                        <JobCard key={job._id} job={job} />
                                    ))}
                                </div>
                            ) : (
                                <p className='text-gray-500'>This company has no active job openings.</p>
                            )}
                        </div>
                    </div>

                    {/* --- Right Column (Sticky Stats & Details Sidebar) --- */}
                    <div className='w-full lg:w-1/3'>
                        <div className='lg:sticky lg:top-10 space-y-6'>
                            
                            {/* --- NEW: Company Details Card --- */}
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <h3 className='text-xl font-semibold mb-4'>Company Details</h3>
                                <div className='space-y-4'>
                                    {/* These components will only render if the data exists */}
                                    <DetailItem icon={assets.location_icon} title="Location" value={company.location} />
                                    <DetailItem icon={assets.add_icon} title="Industry" value={company.industry} />
                                    <DetailItem icon={assets.person_icon} title="Company Size" value={company.companySize} />
                                </div>
                            </div>

                            {/* --- Platform Activity Stats --- */}
                            <div className='bg-white p-6 rounded-lg shadow-md'>
                                <h3 className='text-xl font-semibold mb-4'>Platform Activity</h3>
                                <div className='space-y-4'>
                                    <div className='flex items-center gap-4'>
                                        <img src={assets.suitcase_icon} alt="jobs" className='w-8 h-8' />
                                        <div>
                                            <p className='text-2xl font-bold text-gray-800'>{stats.totalJobs}</p>
                                            <p className='text-gray-600 text-sm'>Active Job Openings</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <img src={assets.person_tick_icon} alt="hires" className='w-8 h-8' />
                                        <div>
                                            <p className='text-2xl font-bold text-gray-800'>{stats.totalHires}</p>
                                            <p className='text-gray-600 text-sm'>Total Accepted Applications</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        {/* Use any icon you have, e.g., home_icon */}
                                        <img src={assets.home_icon} alt="response" className='w-8 h-8' />
                                        <div>
                                            <p className='text-2xl font-bold text-gray-800'>{stats.responseRate}%</p>
                                            <p className='text-gray-600 text-sm'>Application Response Rate</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CompanyProfile;