import React, { createContext, useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import io from 'socket.io-client'; // Socket.io client import

// Initialize Socket Connection
const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(SOCKET_SERVER_URL);

// Create Context
export const AppContext = createContext();

// Context Provider Component
export const AppContextProvider = (props) => {
    // Backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // Clerk Authentication Hooks
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk();

    // Application State
    const [searchFilter, setSearchFilter] = useState({ title: '', location: '' });
    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
    const [companyToken, setCompanyToken] = useState(localStorage.getItem('companyToken') || null);
    const [companyData, setCompanyData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userApplications, setUserApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);

    // --- Logout Functions ---
    const companyLogout = useCallback(() => {
        localStorage.removeItem('companyToken');
        setCompanyToken(null);
        setCompanyData(null);
    }, []);

    const userLogout = useCallback(() => {
        signOut();
        setUserData(null);
        setUserApplications([]);
        setSavedJobs([]);
    }, [signOut]);

    // --- API Functions ---
    const fetchJobs = useCallback(async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/jobs`);
            if (data.success) {
                 setJobs(Array.isArray(data.jobs) ? data.jobs.slice().reverse() : []);
            } else {
                toast.error(data.message || "Failed to fetch jobs.");
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast.error(error.response?.data?.message || error.message || "Could not connect to fetch jobs.");
        }
    }, [backendUrl]);

    const fetchCompanyData = useCallback(async () => {
        if (!companyToken) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/company/company`, {
                headers: { token: companyToken }
            });
            if (data.success) {
                setCompanyData(data.company);
            } else {
                toast.error(data.message || "Failed to fetch company data.");
                companyLogout();
            }
        } catch (error) {
            console.error("Error fetching company data:", error);
            toast.error(error.response?.data?.message || "Authentication error. Please log in again.");
            companyLogout();
        }
    }, [backendUrl, companyToken, companyLogout]);

    const fetchUserData = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const { data } = await axios.get(`${backendUrl}/api/users/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setUserData(data.user);
            } else {
                toast.error(data.message || "Failed to fetch user profile.");
                if (data.message && data.message.toLowerCase().includes('not found')) {
                     console.warn("User data not found in DB for logged-in Clerk user.");
                     setUserData(null);
                } else {
                     userLogout();
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error(error.response?.data?.message || "Authentication error fetching profile.");
            userLogout();
        }
    }, [backendUrl, getToken, userLogout]);

    const fetchUserApplications = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const { data } = await axios.get(`${backendUrl}/api/users/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setUserApplications(Array.isArray(data.applications) ? data.applications : []);
            } else {
                toast.error(data.message || "Failed to fetch applications.");
                // Error check moved to catch block
            }
        } catch (error) { // 'error' is defined here
            console.error("Error fetching user applications:", error);
            toast.error(error.response?.data?.message || "Error fetching applications.");
             // Check the error status HERE inside the catch block
             if (error.response?.status === 401 || error.response?.status === 403) {
                 userLogout();
             }
        }
    }, [backendUrl, getToken, userLogout]);

    const fetchSavedJobs = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const { data } = await axios.get(`${backendUrl}/api/users/saved-jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setSavedJobs(Array.isArray(data.savedJobs) ? data.savedJobs : []);
            } else {
                toast.error(data.message || "Failed to fetch saved jobs.");
                // Error check moved to catch block
            }
        } catch (error) { // 'error' is defined here
            console.error("Error fetching saved jobs:", error);
            toast.error(error.response?.data?.message || "Error fetching saved jobs.");
             // Check the error status HERE inside the catch block
             if (error.response?.status === 401 || error.response?.status === 403) {
                  userLogout();
             }
        }
    }, [backendUrl, getToken, userLogout]);

    const handleSaveJob = useCallback(async (jobId) => {
        if (!user) {
            toast.error("Please log in to save jobs.");
            return;
        }
        try {
            const token = await getToken();
            const { data } = await axios.post(`${backendUrl}/api/users/save-job`,
                { jobId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success(data.message);
                await fetchSavedJobs();
            } else {
                toast.error(data.message || "Failed to update saved job.");
            }
        } catch (error) {
            console.error("Error saving/unsaving job:", error);
            toast.error(error.response?.data?.message || error.message || "Could not save/unsave job.");
             if (error.response?.status === 401 || error.response?.status === 403) {
                  userLogout();
             }
        }
    }, [user, backendUrl, getToken, fetchSavedJobs, userLogout]);

    // --- Effects ---
    useEffect(() => {
        console.log("AppContext mounted. Setting up initial fetch and socket.");
        fetchJobs();

        const handleNewJob = (newJob) => {
            console.log('Received new job via socket:', newJob);
            setJobs(prevJobs => {
                if (prevJobs.some(job => job._id === newJob._id)) {
                    return prevJobs;
                }
                return [newJob, ...prevJobs];
            });
            toast.info(`✨ New Job Posted: ${newJob.title}`);
        };
        const handleConnect = () => console.log('🔗 Connected to Socket.io server');
        const handleDisconnect = (reason) => console.warn(`🔌 Disconnected from Socket.io server: ${reason}`);
        const handleConnectError = (error) => console.error(`❌ Socket connection error: ${error.message}`);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('newJobPosted', handleNewJob);

        return () => {
            console.log("Cleaning up AppContext mount effect & socket listeners...");
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('newJobPosted', handleNewJob);
        };
    }, [fetchJobs]);

    useEffect(() => {
        const storedCompanyToken = localStorage.getItem('companyToken');
        if (storedCompanyToken && !companyToken) { // Set token only if not already set
             setCompanyToken(storedCompanyToken);
        }
        if (companyToken) {
            fetchCompanyData();
        } else {
            setCompanyData(null);
        }
    }, [companyToken, fetchCompanyData]);

    useEffect(() => {
        if (user) {
            console.log("Clerk user detected, fetching user data...");
            fetchUserData();
            fetchUserApplications();
            fetchSavedJobs();
        } else {
            console.log("Clerk user cleared, resetting user state.");
            setUserData(null);
            setUserApplications([]);
            setSavedJobs([]);
        }
    }, [user, fetchUserData, fetchUserApplications, fetchSavedJobs]);

    // --- Provide Context Value ---
    const value = {
        searchFilter, isSearched, jobs, showRecruiterLogin,
        companyToken, companyData,
        userData, userApplications, savedJobs,
        setSearchFilter, setIsSearched, setJobs, setShowRecruiterLogin,
        setCompanyToken, // Keep if needed for direct setting outside login
        setUserData, setUserApplications, setSavedJobs, // Usually not needed directly
         setCompanyData,
        fetchUserData, fetchUserApplications, fetchSavedJobs, handleSaveJob,
        companyLogout, userLogout,
        backendUrl,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};