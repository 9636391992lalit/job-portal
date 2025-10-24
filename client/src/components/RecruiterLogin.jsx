/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RecruiterLogin = () => {
    const navigate = useNavigate();
    const [state, setState] = useState('Login'); // 'Login' or 'Sign Up'

    // Form fields state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [website, setWebsite] = useState(''); // <-- NEW: Website State
    const [domain, setDomain] = useState('');   // <-- NEW: Domain State
    const [cin, setCin] = useState('');       // <-- NEW: CIN State
    const [image, setImage] = useState(null);   // Logo file

    // Stepper state for Sign Up
    const [isTextDataSubmited, setIsTextDataSubmited] = useState(false); // Controls multi-step signup

    // Loading state for API calls
    const [loading, setLoading] = useState(false);

    const { setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading indicator

        // --- Step 1 of Sign Up: Validate Text Fields ---
        if (state === "Sign Up" && !isTextDataSubmited) {
            // Validate all text fields including new ones
            if (!name || !email || !password || !website || !domain || !cin) {
                toast.error("Please fill in all company details.");
                setLoading(false);
                return;
            }
            // Basic website format check
            try {
                new URL(website); // Check if it's a valid URL format (e.g., includes https://)
            } catch (_) {
                toast.error("Please enter a valid website URL (e.g., https://example.com)");
                setLoading(false);
                return;
            }
            // Proceed to image upload step
            setIsTextDataSubmited(true);
            setLoading(false);
            return;
        }

        // --- Handle Login ---
        if (state === "Login") {
            try {
                const { data } = await axios.post(backendUrl + '/api/company/login', { email, password });
                console.log(data)
                if (data.success && data.token) { // Check for token specifically
                    toast.success("Login Successful!");
                    setCompanyData(data.company);
                    setCompanyToken(data.token);
                    localStorage.setItem('companyToken', data.token);
                    setShowRecruiterLogin(false);
                    navigate('/dashboard');
                } else {
                    // Show specific messages for pending/rejected/not found from backend
                    toast.error(data.message || "Login failed. Please check credentials.");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "An error occurred during login.");
            } finally {
                setLoading(false); // Stop loading indicator
            }
            return; // Stop here for login
        }

        // --- Step 2 of Sign Up: Final Submission with Image ---
        if (state === "Sign Up" && isTextDataSubmited) {
            if (!image) {
                toast.error("Please upload the company logo.");
                setLoading(false);
                return;
            }
            try {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('password', password);
                formData.append('email', email);
                formData.append('image', image);
                formData.append('website', website); // Append new fields
                formData.append('domain', domain);   // Append new fields
                formData.append('cin', cin);       // Append new fields

                // --- Call the register endpoint ---
                const { data } = await axios.post(backendUrl + '/api/company/register', formData);

                // --- Handle Backend Response (Pending Approval Flow) ---
                if (data.success) {
                    // Show the success message (pending approval)
                    toast.info(data.message);
                    // Close the modal
                    setShowRecruiterLogin(false);
                    // Reset form state completely
                    setName(''); setEmail(''); setPassword(''); setWebsite('');
                    setDomain(''); setCin(''); setImage(null);
                    setIsTextDataSubmited(false);
                    setState('Login'); // Switch back to Login view
                }
                // --- End Success Handling ---
                else {
                    // Handle specific backend errors (e.g., duplicate email/cin/domain)
                    toast.error(data.message || "Registration failed. Please check details.");
                    // Go back to the text input step
                    setIsTextDataSubmited(false);
                }
            } catch (error) {
                // Handle network or unexpected errors
                toast.error(error.response?.data?.message || error.message || "An error occurred during registration.");
                setIsTextDataSubmited(false); // Go back to text input step
            } finally {
                setLoading(false); // Stop loading indicator
            }
        }
    };

    // Prevent background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Function to reset all fields when switching between Login/Sign Up
    const resetFieldsAndSwitchState = (newState) => {
         setState(newState);
         setIsTextDataSubmited(false); // Always reset step
         setName(''); setEmail(''); setPassword(''); setWebsite('');
         setDomain(''); setCin(''); setImage(null);
    }

    return (
        <div className='fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/40 p-4'> {/* Use fixed inset-0 */}
            <form onSubmit={onSubmitHandler} className='relative bg-white p-6 sm:p-8 rounded-lg shadow-xl text-slate-600 w-full max-w-md max-h-[90vh] overflow-y-auto'> {/* Max height & scroll */}
                <h1 className='text-center text-xl sm:text-2xl text-neutral-800 font-semibold mb-1'>{`Recruiter ${state}`}</h1>
                <p className='text-sm text-center text-gray-500 mb-6'>{state === 'Login' ? 'Welcome back!' : 'Create your recruiter account.'}</p>

                {/* --- Multi-Step Sign Up --- */}
                {state === "Sign Up" && isTextDataSubmited ? (
                    /* --- Image Upload Step --- */
                    <div className='my-6'>
                        <p className='text-sm text-center mb-4 text-neutral-700 font-medium'>Upload Company Logo*</p>
                        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                            <label htmlFor="image" className='cursor-pointer'>
                                <img
                                    className="w-20 h-20 rounded-full object-cover border-2 border-dashed border-gray-300 p-1 hover:border-blue-500"
                                    src={image ? URL.createObjectURL(image) : assets.upload_area} // Use your placeholder asset
                                    alt="Company Logo Upload"
                                />
                                <input
                                    id="image"
                                    accept="image/png, image/jpeg, image/jpg" // Accept common image types
                                    onChange={(e) => setImage(e.target.files[0])}
                                    type="file"
                                    hidden
                                    required // Make image required
                                />
                            </label>
                            <p className='text-xs text-gray-500 mt-2 sm:mt-0'>{image ? image.name : 'Click icon to upload (PNG, JPG)'}</p>
                        </div>
                        {/* Back Button */}
                        <button
                            type="button"
                            onClick={() => setIsTextDataSubmited(false)}
                            className="text-sm text-blue-600 mt-6 block mx-auto hover:underline"
                        >
                            Back to Details
                        </button>
                    </div>
                ) : (
                    /* --- Text Input Step (Login or Sign Up) --- */
                    <div className="space-y-4"> {/* Use space-y for consistent spacing */}
                        {/* Name (Sign Up only) */}
                        {state === 'Sign Up' && (
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Company Name*</label>
                                <div className='border px-3 py-2 flex items-center gap-2 rounded-md focus-within:ring-1 focus-within:ring-blue-500'>
                                    <img src={assets.person_icon} alt="" className='w-4 h-4 text-gray-400' />
                                    <input className='outline-none text-sm w-full bg-transparent' onChange={e => setName(e.target.value)} type="text" value={name} placeholder='e.g., Acme Corp' required />
                                </div>
                            </div>
                        )}

                        {/* Email (Both) */}
                        <div>
                             <label className="text-xs text-gray-500 block mb-1">Company Email*</label>
                            <div className='border px-3 py-2 flex items-center gap-2 rounded-md focus-within:ring-1 focus-within:ring-blue-500'>
                                <img src={assets.email_icon} alt="" className='w-4 h-4 text-gray-400' />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setEmail(e.target.value)} type="email" value={email} placeholder='you@company.com' required />
                            </div>
                        </div>

                        {/* Password (Both) */}
                        <div>
                             <label className="text-xs text-gray-500 block mb-1">Password*</label>
                            <div className='border px-3 py-2 flex items-center gap-2 rounded-md focus-within:ring-1 focus-within:ring-blue-500'>
                                <img src={assets.lock_icon} alt="" className='w-4 h-4 text-gray-400' />
                                <input className='outline-none text-sm w-full bg-transparent' onChange={e => setPassword(e.target.value)} type="password" value={password} placeholder='••••••••' required />
                            </div>
                        </div>

                        {/* --- NEW Fields for Sign Up --- */}
                        {state === 'Sign Up' && (
                            <>
                                {/* Website */}
                                <div>
                                     <label className="text-xs text-gray-500 block mb-1">Official Website*</label>
                                    <div className='border px-3 py-2 flex items-center gap-2 rounded-md focus-within:ring-1 focus-within:ring-blue-500'>
                                        <span className="text-gray-400 text-sm">🌐</span>
                                        <input className='outline-none text-sm w-full bg-transparent' onChange={e => setWebsite(e.target.value)} type="url" value={website} placeholder='https://example.com' required />
                                    </div>
                                </div>
                                {/* Domain */}
                                <div>
                                     <label className="text-xs text-gray-500 block mb-1">Company Domain*</label>
                                    <div className='border px-3 py-2 flex items-center gap-2 rounded-md focus-within:ring-1 focus-within:ring-blue-500'>
                                         <span className="text-gray-400 text-sm">@</span>
                                        <input className='outline-none text-sm w-full bg-transparent' onChange={e => setDomain(e.target.value)} type="text" value={domain} placeholder='example.com' required />
                                    </div>
                                     <p className="text-xs text-gray-400 mt-1 pl-1">Enter the domain part of your company email (e.g., google.com)</p>
                                </div>
                                {/* CIN */}
                                <div>
                                     <label className="text-xs text-gray-500 block mb-1">Company Registration No. (CIN)*</label>
                                    <div className='border px-3 py-2 flex items-center gap-2 rounded-md focus-within:ring-1 focus-within:ring-blue-500'>
                                        <span className="text-gray-400 text-sm">#️⃣</span>
                                        <input className='outline-none text-sm w-full bg-transparent' onChange={e => setCin(e.target.value)} type="text" value={cin} placeholder='Enter CIN' required />
                                    </div>
                                </div>
                            </>
                        )}
                        {/* --- End NEW Fields --- */}

                        {/* Forgot Password Link (Login only) */}
                        {state === "Login" && <p className='text-xs text-blue-600 cursor-pointer text-right hover:underline'> Forgot Password?</p>}
                    </div>
                )}

                {/* --- Submit Button --- */}
                <button
                    type="submit"
                    disabled={loading} // Disable button while loading
                    className='w-full bg-blue-600 text-white py-2.5 rounded-md mt-6 hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-wait' // Improved styling
                >
                    {loading ? 'Processing...' : (state === 'Login' ? 'Login' : (isTextDataSubmited ? 'Submit for Approval' : 'Next: Upload Logo'))}
                </button>

                {/* --- Toggle Login/Sign Up --- */}
                <p className='mt-5 text-center text-sm text-gray-500'>
                    {state === 'Login' ? "Don't have an account?" : "Already have an account?"}
                    <span
                        onClick={() => resetFieldsAndSwitchState(state === 'Login' ? 'Sign Up' : 'Login')} // Use reset function
                        className='text-blue-600 cursor-pointer font-medium hover:underline ml-1'
                    >
                        {state === 'Login' ? 'Sign Up' : 'Login'}
                    </span>
                </p>

                {/* --- Close Button --- */}
                <button type="button" onClick={() => setShowRecruiterLogin(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <img className="w-5 h-5" src={assets.cross_icon} alt="Close" />
                </button>
            </form>
        </div>
    );
};

export default RecruiterLogin;