// src/pages/CompanyProfileSettings.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../components/Loading'; // Import your Loading component

const CompanyProfileSettings = () => {
    const { companyData, setCompanyData, backendUrl, companyToken } = useContext(AppContext);
    
    const [formData, setFormData] = useState({
        description: '',
        industry: '',
        location: '',
        companySize: '1-50' // Default value for the select
    });
    const [loading, setLoading] = useState(false);

    // This effect pre-fills the form when the companyData is loaded
    useEffect(() => {
        if (companyData) {
            setFormData({
                description: companyData.description || '',
                industry: companyData.industry || '',
                location: companyData.location || '',
                companySize: companyData.companySize || '1-50'
            });
        }
    }, [companyData]);

    const onChangeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.put(
                `${backendUrl}/api/company/update-profile`,
                formData,
                { headers: { token: companyToken } }
            );

            if (data.success) {
                toast.success(data.message);
                // IMPORTANT: Update the global context with the new data
                setCompanyData(data.company);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
        setLoading(false);
    };
    
    // Show loading if companyData isn't available yet
    if (!companyData) {
        return <Loading />;
    }

    return (
        <form onSubmit={onSubmitHandler} className='container p-4 flex flex-col w-full item-start gap-4 max-w-2xl'>
            <h2 className="text-2xl font-semibold mb-4">Company Profile</h2>
            
            <div className='w-full'>
                <p className='mb-2 font-medium text-gray-700'>Company Description</p>
                <textarea
                    name="description"
                    onChange={onChangeHandler}
                    value={formData.description}
                    placeholder='Tell us about your company, mission, and culture...'
                    rows="6"
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-blue-500'
                />
            </div>

            <div className='w-full'>
                <p className='mb-2 font-medium text-gray-700'>Industry</p>
                <input
                    name="industry"
                    type="text"
                    placeholder='e.g., "Software", "FinTech", "E-commerce"'
                    onChange={onChangeHandler}
                    value={formData.industry}
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-blue-500'
                />
            </div>

            <div className='w-full'>
                <p className='mb-2 font-medium text-gray-700'>Headquarters Location</p>
                <input
                    name="location"
                    type="text"
                    placeholder='e.g., "San Francisco, CA"'
                    onChange={onChangeHandler}
                    value={formData.location}
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-blue-500'
                />
            </div>

            <div className='w-full'>
                <p className='mb-2 font-medium text-gray-700'>Company Size</p>
                <select
                    name="companySize"
                    onChange={onChangeHandler}
                    value={formData.companySize}
                    className='w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-blue-500'
                >
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1,000 employees</option>
                    <option value="1001-5000">1,001-5,000 employees</option>
                    <option value="5000+">5,000+ employees</option>
                </select>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className='w-40 py-3 mt-4 bg-black text-white rounded disabled:bg-gray-400 hover:bg-gray-800'
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
};

export default CompanyProfileSettings;