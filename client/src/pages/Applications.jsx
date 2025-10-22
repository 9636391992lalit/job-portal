/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { assets } from '../assets/assets'; // removed jobsApplied as it wasn't used
import moment from 'moment';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../components/Loading'; // Import Loading component

const Applications = () => {
    const { user, isLoaded } = useUser(); // Use isLoaded to check if Clerk is ready
    const { getToken } = useAuth();
    const [isEdit, setIsEdit] = useState(false);
    const [resume, setResume] = useState(null);
    const { backendUrl, userData, userApplications, fetchUserData, fetchUserApplications } = useContext(AppContext);

    const updateResume = async () => {
        if (!resume) {
            toast.warn("Please select a resume file first.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('resume', resume);

            const token = await getToken();
            const { data } = await axios.post(backendUrl + '/api/users/update-resume', formData, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                await fetchUserData(); // Refresh user data to get the new resume URL
                setIsEdit(false);
                setResume(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch applications only when the user is loaded and exists
    useEffect(() => {
        if (isLoaded && user) {
            fetchUserApplications();
        }
    }, [user, isLoaded]); // Depend on isLoaded as well

    // Show loading spinner if Clerk user or user data isn't loaded yet
    if (!isLoaded || !userData) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
                <h2 className='text-xl font-semibold'>Your Resume</h2>
                <div className='flex gap-2 mb-6 mt-3 '>
                    {
                        // Simplified condition: Show edit mode if isEdit is true OR if there's no resume URL
                        isEdit || !userData.resume ? <>
                            <label className='flex items-center' htmlFor="resumeUpload">
                                <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2 cursor-pointer'>{resume ? resume.name : "Select Resume (PDF)"}</p>
                                <input id='resumeUpload' onChange={(e) => (setResume(e.target.files[0]))} accept="application/pdf" type="file" hidden />
                                <img src={assets.profile_upload_icon} alt="" />
                            </label>
                            <button onClick={updateResume} className='bg-green-100 border border-green-400 rounded-lg px-4 py-2 disabled:bg-gray-200 disabled:cursor-not-allowed' disabled={!resume}>
                                Save
                            </button>
                            {/* Allow canceling edit mode if a resume already exists */}
                            {userData.resume && (
                                <button onClick={() => { setIsEdit(false); setResume(null); }} className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2 ml-2'>
                                    Cancel
                                </button>
                            )}
                        </> :
                            // Display mode: Show resume link and Edit button
                            <div className='flex gap-2'> {/* <-- FIX: Corrected class name */}
                                <a className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200' target='_blank' href={userData.resume} rel="noreferrer">
                                    View Resume
                                </a>
                                <button onClick={() => setIsEdit(true)} className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2 ml-2 hover:bg-gray-100'>
                                    Edit
                                </button>
                            </div>
                    }
                </div>

                <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>
                {userApplications.length > 0 ? (
                    <table className='min-w-full bg-white border rounded-lg'>
                        <thead>
                            <tr className='py-3 px-4 border-b text-left'>
                                <th className='py-3 px-4 border-b text-left'>Company</th>
                                <th className='py-3 px-4 border-b text-left'>Job Title</th>
                                <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
                                <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
                                <th className='py-3 px-4 border-b text-left'>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userApplications.map((app, index) => app ? (
                                <tr key={app._id || index}>
                                    {/* --- FIX: Added optional chaining and fallback text --- */}
                                    <td className='py-3 px-4 flex items-center gap-2 border-b'> {/* <-- FIX: Added 'flex' */}
                                        <img className='w-7 h-8 object-contain' src={app.companyId?.image || assets.placeholder_icon } alt="" /> {/* Use placeholder if no image */}
                                        <span>{app.companyId?.name || 'Deleted Company'}</span>
                                    </td>
                                    {/* --- FIX: Added optional chaining and fallback text --- */}
                                    <td className='py-2 px-4 border-b'>{app.jobId?.title || 'Deleted Job'}</td>
                                    {/* --- FIX: Added optional chaining and fallback text --- */}
                                    <td className='py-2 px-4 border-b max-sm:hidden'>{app.jobId?.location || 'N/A'}</td>
                                    <td className='py-2 px-4 border-b max-sm:hidden'>{moment(app.date).format('ll')}</td>
                                    <td className='py-2 px-4 border-b'>
                                        <span className={`${app.status === 'Accepted' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} px-4 py-1.5 rounded-full text-xs font-medium`}> {/* Rounded-full for pill shape */}
                                            {app.status}
                                        </span>
                                    </td>
                                </tr>
                            ) : null)}
                        </tbody>
                    </table>
                ) : (
                     // Display message if no applications found
                     <p className='text-gray-500'>You haven't applied for any jobs yet.</p>
                )}
                <Footer />
            </div>
        </>
    )
}

export default Applications;