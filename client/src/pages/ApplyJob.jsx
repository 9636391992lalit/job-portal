import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import kconvert from 'k-convert'
import moment from 'moment'
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs' // Icons import ho gaye hain

const ApplyJob = () => {
    const { id } = useParams()
    const { getToken } = useAuth()
    const navigate = useNavigate()
    const [JobData, setJobData] = useState(null)
    const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)

    // Context se save job functions aa gaye hain
    const { jobs, backendUrl, userData, userApplications, fetchUserApplications, handleSaveJob, savedJobs } = useContext(AppContext)
    const { user } = useUser()

    const fetchJob = async () => {
        try {
            const { data } = await axios.get(backendUrl + `/api/jobs/${id}`)
            if (data.success) {
                setJobData(data.job)
            } else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

    const applyHandler = async () => {
        // Yeh function waisa hi hai jaisa aapne diya tha
        console.log("User Data", userData);
        try {
            if (!user) {
                return toast.error('Login To apply for jobs')
            }
            if (!userData) { // Check if user data from DB is loaded
                return toast.warn('User data still loading, please wait...'); // Or handle differently
            }
            if (!userData.resume) {
                navigate('/applications')
                return toast.error('Upload resume to apply')
            }
            const token = await getToken()
            const { data } = await axios.post(backendUrl + '/api/users/apply',
                { jobId: JobData._id },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                toast.success(data.message)
                fetchUserApplications()
                setIsAlreadyApplied(true);
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const checkAlreadyApplied = () => {
        if (!JobData || !userApplications) return;
        const hasApplied = userApplications.some(item => item.jobId?._id === JobData?._id) // Thoda safe check
        setIsAlreadyApplied(hasApplied)
    }

    useEffect(() => {
        fetchJob()
    }, [id])

    useEffect(() => {
        // Check karein ki userApplications aur JobData dono loaded hain
        if (userApplications && JobData) {
            checkAlreadyApplied()
        }
    }, [JobData, userApplications, id])

    // isSaved variable bhi define ho gaya hai
    const isSaved = savedJobs?.some(savedJob => savedJob?._id === JobData?._id);

    return JobData ? (
        <>
            <Navbar />
            <div className="min-h-screen flex-col py-10 container px-4 2xl:px-20 mx-auto">
                <div className="bg-white text-black rounded-lg w-full">
                    <div className='flex justify-center md:justify-between flex-wrap gp-8 px-14 py-20 mb-6 bg-sky-50 border-sky-400 rounded-xl'>
                        <div className='flex flex-col md:flex-row items-center'>
                            <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={JobData.companyId.image} alt="" />
                            <div className='text-center md:text-left text-neutral-700'>
                                <h1 className='text-2xl sm:text-4xl font-medium'>{JobData.title}</h1>
                                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2  gap-6 items-center text-gray-600 mt-2'>
                                    {/* ... baaki job details ... */}
                                    <span className='flex items-center gap-1'>
                                        <img src={assets.suitcase_icon} alt="" />
                                        <Link to={`/company/${JobData.companyId._id}`} className="hover:underline">
                                            {JobData.companyId.name}
                                        </Link>
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        <img src={assets.location_icon} alt="" />
                                        {JobData.location}
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        <img src={assets.person_icon} alt="" />
                                        {JobData.level}
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        <img src={assets.money_icon} alt="" />
                                        CTC:{kconvert.convertTo(JobData.salary)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* --- Buttons ka Section Update kiya gaya --- */}
                        <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center w-full md:w-auto'>
                            {/* Apply Button Update kiya gaya */}
                            <button
                                onClick={applyHandler}
                                // Disable karein agar already applied hai YA job visible nahi hai
                                disabled={isAlreadyApplied || !JobData.visible}
                                className="bg-blue-600 p-2.5 px-10 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isAlreadyApplied ? 'Already Applied' : (JobData.visible ? 'Apply now' : 'Job Closed')}
                            </button>

                            {/* --- NEW: Save Job Button --- */}
                            {user && ( // Sirf logged-in user ko dikhega
                                <button
                                    onClick={() => handleSaveJob(JobData._id)}
                                    className={`flex items-center justify-center gap-2 w-full p-2.5 px-10 mt-2 rounded border ${isSaved
                                        ? 'bg-blue-100 text-blue-700 border-blue-300'
                                        : 'bg-gray-100 text-gray-800 border-gray-300'
                                        }`}
                                >
                                    {isSaved ? <BsBookmarkFill /> : <BsBookmark />}
                                    {isSaved ? 'Job Saved' : 'Save for later'}
                                </button>
                            )}
                            {/* --- End Save Button --- */}

                            <p className='mt-1 text-gray-600'>Posted {moment(JobData.date).fromNow()}</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start">
                        <div className='w-full lg:w-2/3'>
                            <h2 className='font-bold text-2xl mb-4'>Job Description</h2>
                            <div className="rich-text" dangerouslySetInnerHTML={{ __html: JobData.description }}></div>

                            {/* Niche waala Apply button bhi update kiya gaya */}
                            <button
                                onClick={applyHandler}
                                disabled={isAlreadyApplied || !JobData.visible}
                                className="bg-blue-600 p-2.5 px-10 text-white rounded mt-10 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isAlreadyApplied ? 'Already Applied' : (JobData.visible ? 'Apply now' : 'Job Closed')}
                            </button>
                        </div>
                        <div className='w-full lg:w-1/3 mt-8 lg:mt-8 space-y-5'> {/* <-- FIX: space -y-5 ko space-y-5 kiya */}
                            {/*Right Section More Jobs */}
                            <h2>More Job from {JobData.companyId.name}</h2>
                            {
                                // eslint-disable-next-line no-unused-vars
                                jobs.filter(job => job._id !== JobData._id && job.companyId._id == JobData.companyId._id).filter((job) => {
                                    //Set of applied jobsIds
                                    const appliedJobsIds = new Set(userApplications.map(app => app.jobId && app.jobId._id))
                                    // retuen true if the user has not applied for this job.
                                    return !appliedJobsIds.has(job._id)
                                }).slice(0, 4).map((job, index) => <JobCard key={index} job={job} />)
                            }
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </>
    ) : (
        <Loading />
    )
}

export default ApplyJob