// src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useRef } from 'react'; // Import useState, useEffect, useRef
import { assets } from '../assets/assets';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const { openSignIn } = useClerk();
    const { user } = useUser();
    const navigate = useNavigate();
    const { setShowRecruiterLogin } = useContext(AppContext);
    
    // --- State for Dropdown Visibility ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null); // Ref to detect clicks outside
    // ------------------------------------

    // --- Effect to close menu on outside click ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        // Add listener if menu is open
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            // Remove listener if menu is closed
            document.removeEventListener('mousedown', handleClickOutside);
        }
        // Cleanup function to remove listener when component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]); // Re-run effect when isMenuOpen changes
    // ---------------------------------------------

    // Helper function to close menu after navigation
    const handleMenuClick = (path) => {
        navigate(path);
        setIsMenuOpen(false); // Close menu after clicking an item
    };


    return (
        <div className='shadow py-4'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
                <img onClick={() => navigate('/')} className='cursor-pointer h-8 sm:h-auto' src={assets.logo} alt="InsiderJobs Logo" />
                {
                    user ? (
                        <div className='flex items-center gap-4 sm:gap-6'>
                            {/* Display User Name */}
                            <p className='text-sm sm:text-base max-sm:hidden'>Hi, {user.firstName}</p>
                            
                            {/* --- Dropdown Menu --- */}
                            <div className='relative' ref={menuRef}> {/* Add ref here */}
                                {/* Menu Button */}
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle menu state
                                    className='px-3 py-1 border rounded hover:bg-gray-100 flex items-center gap-1'
                                >
                                    Menu
                                    {/* Optional: Add dropdown arrow icon */}
                                    <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {/* Dropdown Content - Conditionally Rendered */}
                                {isMenuOpen && (
                                    <div className='absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20'>
                                        <ul className='py-1 text-gray-700 text-sm'>
                                            {/* Use onClick with helper function */}
                                            <li>
                                                <button onClick={() => handleMenuClick('/applications')} className='block w-full text-left px-4 py-2 hover:bg-gray-100'>Applied Jobs</button>
                                            </li>
                                            <li>
                                                <button onClick={() => handleMenuClick('/saved-jobs')} className='block w-full text-left px-4 py-2 hover:bg-gray-100'>Saved Jobs</button>
                                            </li>
                                            <li>
                                                <button onClick={() => handleMenuClick('/my-profile')} className='block w-full text-left px-4 py-2 hover:bg-gray-100'>My Profile</button>
                                            </li>
                                            {/* You could add a divider here if needed */}
                                            {/* <li className="border-t my-1"></li> */}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {/* --- End Dropdown Menu --- */}

                            {/* Clerk User Button (handles sign out etc.) */}
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    ) : (
                        <div className='flex gap-4 max-sm:text-xs items-center'>
                            <button onClick={() => setShowRecruiterLogin(true)} className='text-gray-600 hover:text-blue-600'>Recruiter Login</button>
                            <button onClick={() => openSignIn()} className='bg-blue-600 text-white px-5 sm:px-7 py-2 rounded-full hover:bg-blue-700'>Login</button>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default Navbar;