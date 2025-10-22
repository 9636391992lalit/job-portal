import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'; // Import useClerk
import { toast } from 'react-toastify';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    // --- Clerk User ---
    const { user } = useUser();
    const { getToken } = useAuth();
    const { signOut } = useClerk(); // Get the signOut function from Clerk

    // --- State ---
    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    });
    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
    
    // --- Company (Recruiter) State ---
    const [companyToken, setCompanyToken] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    
    // --- Clerk User State ---
    const [userData, setUserData] = useState(null);
    const [userApplications, setUserApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]); // <-- NEW: Saved Jobs state
    // --- Helper Function: Company Logout ---
    const companyLogout = () => {
        localStorage.removeItem('companyToken');
        setCompanyToken(null);
        setCompanyData(null);
        toast.info("Your session has expired. Please log in again.");
    };

    // --- Helper Function: Clerk User Logout ---
    const userLogout = () => {
        signOut(); // Tell Clerk to end its session
        setUserData(null); // Clear our local user data
        setUserApplications([]); // Clear our local application data
        toast.info("Your session has expired. Please log in again.");
    };

    // --- API Function: Fetch Jobs (Public) ---
    const fetchJobs = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/jobs');
            if (data.success) {
                setJobs(data.jobs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // --- API Function: Fetch Company Data (Protected) ---
    const fetchCompanyData = async () => {
        // Only run if there is a token
        if (!companyToken) return;
        try {
            const { data } = await axios.get(backendUrl + '/api/company/company', {
                headers: { token: companyToken }
            });
            if (data.success) {
                setCompanyData(data.company);
            } else {
                toast.error(data.message);
                companyLogout(); // <-- Logout on failure
            }
        } catch (error) {
            toast.error("Authentication failed. Please log in again.");
            companyLogout(); // <-- Logout on error (e.g., 401 Unauthorized)
        }
    };

    // --- API Function: Fetch User Data (Protected) ---
    const fetchUserData = async () => {
        try {
            const token = await getToken(); 
            if (!token) return; // Don't run if clerk has no token
            const { data } = await axios.get(backendUrl + '/api/users/user', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUserData(data.user);
            } else {
                toast.error(data.message);
                userLogout(); // <-- Logout on failure
            }
        } catch (error) {
            toast.error("Authentication failed. Please log in again.");
            userLogout(); // <-- Logout on error
        }
    };

    // --- API Function: Fetch User Applications (Protected) ---
    const fetchUserApplications = async () => {
        try {
            const token = await getToken();
            if (!token) return; // Don't run if clerk has no token
            const { data } = await axios.get(backendUrl + '/api/users/applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setUserApplications(data.applications);
            } else {
                toast.error(data.message);
                userLogout(); // <-- Logout on failure
            }
        } catch (error) {
            toast.error("Could not fetch applications. Please log in again.");
            userLogout(); // <-- Logout on error
        }
    };
     const fetchSavedJobs = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const { data } = await axios.get(backendUrl + '/api/users/saved-jobs', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setSavedJobs(data.savedJobs);
            } else {
                // Logout nahi karenge, bas error dikhayenge
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Could not fetch saved jobs.");
        }
    };
    const handleSaveJob = async (jobId) => {
        if (!user) {
            toast.error("Please log in to save jobs");
            return;
        }
        try {
            const token = await getToken();
            const { data } = await axios.post(backendUrl + '/api/users/save-job',
                { jobId }, // body mein jobId bhejein
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                // Saved jobs ko re-fetch karein taaki UI update ho
                await fetchSavedJobs();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    // --- Effects ---

    // Initial load for jobs and checking for company token
    useEffect(() => {
        fetchJobs();
        const storedCompanyToken = localStorage.getItem('companyToken');
        if (storedCompanyToken) {
            setCompanyToken(storedCompanyToken);
        }
    }, []);
    
    // Fetch company data when token is set
    useEffect(() => {
        if (companyToken) {
            fetchCompanyData();
        } else {
            // Clear data if token becomes null
            setCompanyData(null);
        }
    }, [companyToken]);

    // Fetch user data when Clerk user is detected
    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchUserApplications();
            fetchSavedJobs();
        } else {
            // Clear data if Clerk user is null
            setUserData(null);
            setUserApplications([]);
            setSavedJobs([]);
        }
    }, [user]); // Re-run when the Clerk user object changes

    // --- Context Value ---
    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData, fetchUserApplications,
        companyLogout ,// <-- Expose the companyLogout function
        savedJobs,
        handleSaveJob
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};