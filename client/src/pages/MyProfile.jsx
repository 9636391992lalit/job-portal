// src/pages/MyProfile.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets'; // For cross icon

// --- Reusable Form Components ---
const Section = ({ title, children }) => (
    <div className="border-t pt-4 mt-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const Input = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            id={name} 
            name={name}
            {...props} 
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
    </div>
);
// --- End of Reusable Components ---

const MyProfile = () => {
    const { userData, backendUrl, fetchUserData } = useContext(AppContext);
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        headline: '', location: '', skills: [],
        experience: [], education: [],
        portfolioLink: '', linkedinLink: ''
    });
    const [currentSkill, setCurrentSkill] = useState('');

    // Pre-fill form when userData loads
    useEffect(() => {
        if (userData) {
            setFormData({
                headline: userData.headline || '',
                location: userData.location || '',
                skills: userData.skills || [],
                experience: userData.experience || [],
                education: userData.education || [],
                portfolioLink: userData.portfolioLink || '',
                linkedinLink: userData.linkedinLink || ''
            });
        }
    }, [userData]);

    if (!userData) {
        return <Loading />;
    }

    // --- Handlers ---
    const handleTextChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (currentSkill && !formData.skills.includes(currentSkill)) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, currentSkill] }));
            setCurrentSkill('');
        }
    };
    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleArrayChange = (e, index, type) => {
        const { name, value } = e.target;
        const list = [...formData[type]];
        list[index][name] = value;
        setFormData(prev => ({ ...prev, [type]: list }));
    };

    const handleAddItem = (type) => {
        if (type === 'experience') {
            setFormData(prev => ({
                ...prev,
                experience: [...prev.experience, { title: '', company: '', years: '' }]
            }));
        } else if (type === 'education') {
            setFormData(prev => ({
                ...prev,
                education: [...prev.education, { degree: '', institution: '', year: '' }]
            }));
        }
    };

    const handleRemoveItem = (index, type) => {
        const list = [...formData[type]];
        list.splice(index, 1);
        setFormData(prev => ({ ...prev, [type]: list }));
    };

    // --- Submit Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await getToken();
            // This reuses your existing backend route
            const { data } = await axios.put(
                `${backendUrl}/api/users/update-profile`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                fetchUserData(); // Re-fetch user data to update context
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div className="container 2xl:px-20 mx-auto my-10 px-4">
                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>
                    
                    <Section title="Basic Information">
                        <Input label="Headline" name="headline" value={formData.headline} onChange={handleTextChange} placeholder="e.g., Software Engineer at Google" />
                        <Input label="Location" name="location" value={formData.location} onChange={handleTextChange} placeholder="e.g., Mumbai, India" />
                    </Section>
                    
                    <Section title="Links">
                        <Input label="Portfolio URL" name="portfolioLink" value={formData.portfolioLink} onChange={handleTextChange} placeholder="https://my-portfolio.com" />
                        <Input label="LinkedIn URL" name="linkedinLink" value={formData.linkedinLink} onChange={handleTextChange} placeholder="https://linkedin.com/in/username" />
                    </Section>

                    <Section title="Skills">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={currentSkill}
                                onChange={(e) => setCurrentSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                placeholder="e.g., React"
                                className="flex-1 p-2 border border-gray-300 rounded"
                            />
                            <button type="button" onClick={handleAddSkill} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                                    {skill}
                                    <img 
                                        src={assets.cross_icon} 
                                        alt="Remove" 
                                        className="w-3 h-3 cursor-pointer opacity-60 hover:opacity-100" 
                                        onClick={() => handleRemoveSkill(skill)} 
                                    />
                                </span>
                            ))}
                        </div>
                    </Section>

                    <Section title="Experience">
                        {formData.experience.map((item, index) => (
                            <div key={index} className="p-4 border rounded space-y-3 relative mb-3 bg-gray-50">
                                <button type="button" onClick={() => handleRemoveItem(index, 'experience')} className="absolute -top-2 -right-2 bg-red-100 p-1 rounded-full hover:bg-red-200">
                                    <img src={assets.cross_icon} alt="Remove" className="w-4 h-4" />
                                </button>
                                <Input label="Title" name="title" value={item.title} onChange={(e) => handleArrayChange(e, index, 'experience')} />
                                <Input label="Company" name="company" value={item.company} onChange={(e) => handleArrayChange(e, index, 'experience')} />
                                <Input label="Years" name="years" value={item.years} onChange={(e) => handleArrayChange(e, index, 'experience')} placeholder="e.g., 2020-2023" />
                            </div>
                        ))}
                        <button type="button" onClick={() => handleAddItem('experience')} className="text-blue-600 font-medium mt-2 hover:text-blue-800">+ Add Experience</button>
                    </Section>

                    <Section title="Education">
                        {formData.education.map((item, index) => (
                            <div key={index} className="p-4 border rounded space-y-3 relative mb-3 bg-gray-50">
                                <button type="button" onClick={() => handleRemoveItem(index, 'education')} className="absolute -top-2 -right-2 bg-red-100 p-1 rounded-full hover:bg-red-200">
                                    <img src={assets.cross_icon} alt="Remove" className="w-4 h-4" />
                                </button>
                                <Input label="Degree / Certificate" name="degree" value={item.degree} onChange={(e) => handleArrayChange(e, index, 'education')} />
                                <Input label="Institution" name="institution" value={item.institution} onChange={(e) => handleArrayChange(e, index, 'education')} />
                                <Input label="Year" name="year" value={item.year} onChange={(e) => handleArrayChange(e, index, 'education')} placeholder="e.g., 2016-2020" />
                            </div>
                        ))}
                        <button type="button" onClick={() => handleAddItem('education')} className="text-blue-600 font-medium mt-2 hover:text-blue-800">+ Add Education</button>
                    </Section>

                    <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:bg-gray-400 mt-6">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default MyProfile;