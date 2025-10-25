import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import Loading from '../components/Loading';

import Footer from '../components/Footer';
import { assets } from '../assets/assets';

// Helper Components (can be moved to a separate file if reused elsewhere)
const ProfileSection = ({ title, children }) => {
    if (!children || (Array.isArray(children) && children.length === 0)) return null;
    return (
        <div className="mb-6">
            <h4 className="text-xl font-semibold border-b pb-2 mb-4 text-gray-800">{title}</h4>
            {children}
        </div>
    );
};

const ListItem = ({ primary, secondary, tertiary }) => (
    <div className="mb-4 relative pl-4">
        <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
        <p className="font-medium text-gray-900">{primary}</p>
        <p className="text-sm text-gray-700">{secondary}</p>
        {tertiary && <p className="text-xs text-gray-500">{tertiary}</p>}
    </div>
);

// Main Component
const ApplicantProfile = () => {
    const { id } = useParams();
    const { backendUrl } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true); // Ensure loading is true at the start
            try {
                const { data } = await axios.get(`${backendUrl}/api/users/public-profile/${id}`);
                if (data.success) {
                    setUser(data.user);
                } else {
                     console.error("API Error:", data.message); // Log API errors
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
            setLoading(false);
        };

        fetchUserProfile();
    }, [id, backendUrl]);

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="min-h-[70vh] flex items-center justify-center">
                    <p className="text-2xl text-gray-600">Applicant not found.</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            
            <div className="container 2xl:px-20 mx-auto my-10 px-4">
                <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-lg">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b pb-8">
                        <img
                            src={user.image || assets.placeholder_icon}
                            alt={user.name}
                            className="w-24 h-24 rounded-full border-4 border-gray-200"
                        />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                            {user.headline && <p className="text-lg text-gray-700">{user.headline}</p>}
                            {user.location && <p className="text-sm text-gray-500 mt-1">{user.location}</p>}
                        </div>
                    </div>

                    {/* Contact & Links */}
                    <ProfileSection title="Contact & Links">
                        <div className="space-y-3 text-sm"> {/* Increased spacing */}
                            {user.email && <p><span className="font-semibold text-gray-600">Email:</span> <span className='text-gray-800'>{user.email}</span></p>}
                            {user.portfolioLink && <p><span className="font-semibold text-gray-600">Portfolio:</span> <a href={user.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{user.portfolioLink}</a></p>}
                            {user.linkedinLink && <p><span className="font-semibold text-gray-600">LinkedIn:</span> <a href={user.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{user.linkedinLink}</a></p>}
                        </div>
                    </ProfileSection>

                    {/* Resume */}
                    {user.resume && (
                        <ProfileSection title="Resume">
                            <a
                                href={user.resume} 
                                // Inline display flag
                                target="_blank"
                                rel="noopener noreferrer"
                                className='bg-blue-600 text-white px-5 py-2 rounded-md inline-flex gap-2 items-center hover:bg-blue-700 text-sm font-medium transition-colors'
                            >
                                View Resume <img src={assets.resume_download_icon} alt="view resume" className='w-4 h-4 invert' />
                            </a>
                        </ProfileSection>
                    )}

                    {/* Skills */}
                    {user.skills && user.skills.length > 0 && (
                        <ProfileSection title="Skills">
                            <div className="flex flex-wrap gap-2">
                                {user.skills.map((skill, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </ProfileSection>
                    )}

                    {/* Experience */}
                    {user.experience && user.experience.length > 0 && (
                        <ProfileSection title="Experience">
                            <div className='space-y-4'> {/* Added spacing between items */}
                                {user.experience.map((exp, index) => (
                                    <ListItem
                                        key={index}
                                        primary={exp.title}
                                        secondary={exp.company}
                                        tertiary={exp.years}
                                    />
                                ))}
                            </div>
                        </ProfileSection>
                    )}

                    {/* Education */}
                    {user.education && user.education.length > 0 && (
                        <ProfileSection title="Education">
                             <div className='space-y-4'> {/* Added spacing between items */}
                                {user.education.map((edu, index) => (
                                    <ListItem
                                        key={index}
                                        primary={edu.degree}
                                        secondary={edu.institution}
                                        tertiary={edu.year}
                                    />
                                ))}
                            </div>
                        </ProfileSection>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ApplicantProfile;