import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import Loading from '../components/Loading'; // Loading component import karein
import { useUser } from '@clerk/clerk-react';

const SavedJobs = () => {
    const { savedJobs } = useContext(AppContext);
    const { isLoaded } = useUser(); // Clerk se check karein ki user load hua ya nahi

    // Jab tak user/saved jobs load ho rahe hain, loading dikhayein
    if (!isLoaded) {
        return <Loading />;
    }

    return (
        <>
            <Navbar />
            <div className='container 2xl:px-20 mx-auto min-h-[70vh] my-10 px-4'>
                <h2 className='text-3xl font-semibold mb-8'>My Saved Jobs</h2>
                {savedJobs.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                        {/* Saved jobs ko map karke JobCard dikhayein */}
                        {savedJobs.map((job) => (
                            job ? <JobCard key={job._id} job={job} /> : null
                        ))}
                    </div>
                ) : (
                    // Agar koi job saved nahi hai
                    <p className='text-gray-500 text-lg'>
                        You haven't saved any jobs yet. Click the bookmark icon on a job to save it!
                    </p>
                )}
            </div>
            <Footer />
        </>
    );
};

export default SavedJobs;