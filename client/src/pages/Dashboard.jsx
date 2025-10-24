import React ,{useContext, useEffect}from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import {AppContext} from '../context/AppContext'

const Dashboard = () => {
    const navigate =useNavigate()
    // Get companyData and the companyLogout function from context
    const {companyData, companyLogout}=useContext(AppContext)
    
    // This function now uses the centralized logout logic
    const logout=()=>{
        companyLogout(); // Call the function from context
        navigate('/');   // Navigate home
    }
    
    useEffect(()=>{
        if(companyData) {
            // Only navigate if we are on the base /dashboard route
            if (window.location.pathname === '/dashboard' || window.location.pathname === '/dashboard/') {
                 navigate('/dashboard/manage-jobs');
            }
        }
    },[companyData, navigate])      

    return (
        <div className='min-h-screen'>
            {/* Navbar For recruiter Login */}
            <div className='shadow py-4'>
                <div className='px-5 flex justify-between items-center'>
                    <img onClick={()=>navigate('/')}className='max-sn:w-32 cursor-pointer'  src={assets.logo} alt="" />
                    {companyData&&(
                        <div className='flex items-center gap-3'>
                            
                            <p className='max-sm:hidden'>
                                Welcome, {companyData.name}
                            </p>
                            <div className='relative group'>
                                <img className='w-8 border rounded-full' src={companyData.image} alt="" />
                                <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12 '>
                                    <ul className='list-none m-0 p-2 bg-white rounded -md border text-sm '>
                                        <li onClick={logout} className='py-1 px-2 cursor-pointer pr-10'>Logout</li>
                                    </ul>
                                </div>
                            </div>

                        </div>
                    )}
                    
                </div>
            </div>
            <div className='flex items-start'>
                {/*Left Side bar to add option to add job, manage jobs and view the application*/}
                <div className='inline-block min-h-screen border-r-2'>
                    <ul className='flex flex-col items-start pt-5 text-gray-800'>
                        <NavLink className={({isActive})=>`flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive&&'bg-blue-100 border-r-4 border-blue-500 '}`} to={'/dashboard/add-job'}>
                        <img className='min-w-4'src={assets.add_icon} alt="" />
                        <p className='max-sm:hidden'>Add Job</p>
                        </NavLink>

                        <NavLink className={({isActive})=>`flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive&&'bg-blue-100 border-r-4 border-blue-500 '}`}to={'/dashboard/manage-jobs'}>
                        <img className='min-w-4' src={assets.home_icon} alt="" />
                        <p className='max-sm:hidden'>Manage Jobs</p>
                        </NavLink>

                        <NavLink className={({isActive})=>`flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive&&'bg-blue-100 border-r-4 border-blue-500 '}`}to={'/dashboard/view-applications'}>
                        <img className='min-w-4' src={assets.person_tick_icon} alt="" />
                        <p className='max-sm:hidden'>View Application</p>
                        </NavLink>
                        {/* --- ADD THIS NEW NAVLINK --- */}
                        <NavLink 
                            className={({isActive})=>`flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive&&'bg-blue-100 border-r-4 border-blue-500 '}`}
                            to={'/dashboard/profile'}
                        >
                            {/* Use a fitting icon from your assets */}
                            <img className='min-w-4' src={assets.person_icon} alt="profile icon" /> 
                            <p className='max-sm:hidden'>Company Profile</p>
                        </NavLink>
                    </ul>
                </div>
                <div className="flex-1 h-full p-2 sm:p-5 ">
                    <Outlet/>
                </div>
            </div>
        </div>
    )
}

export default Dashboard