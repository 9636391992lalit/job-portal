import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { assets, JobCategories, JobLocations } from '../assets/assets'; // Assuming these arrays exist
import JobCard from './JobCard';

const JobListing = () => {
    const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);
    
    // State for UI control
    const [showFilter, setShowFilter] = useState(true); // Toggle filters on mobile
    const [currentPage, setCurrentPage] = useState(1); // Pagination
    
    // State for filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [minSalary, setMinSalary] = useState(0);         // Default min salary (₹0)
    const [maxSalary, setMaxSalary] = useState(10000000); // Default max salary (₹1 Crore)
    
    // State for the jobs currently displayed
    const [filteredJobs, setFilteredJobs] = useState([]); // Initialize as empty array

    // Initialize filteredJobs when jobs load from context
    useEffect(() => {
        setFilteredJobs(jobs.slice().reverse()); // Show newest jobs first initially
    }, [jobs]);


    // --- Filter Handlers ---
    const handleCategoryChange = (category) => {
        setSelectedCategories(
            prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handleLocationChange = (location) => {
        setSelectedLocations(
            prev => prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
        );
    };

    const handleMinSalaryChange = (e) => {
        const value = parseInt(e.target.value, 10);
        // Ensure it's a non-negative number, default to 0 if invalid input
        setMinSalary(isNaN(value) || value < 0 ? 0 : value); 
    };

    const handleMaxSalaryChange = (e) => {
        const value = parseInt(e.target.value, 10);
        // Ensure it's a non-negative number, default to 0 if invalid input
        setMaxSalary(isNaN(value) || value < 0 ? 0 : value); 
    };
    // --- End Filter Handlers ---


    // --- Effect to Apply Filters ---
    useEffect(() => {
        // Define filter matching functions
        const matchesCategory = job => selectedCategories.length === 0 || selectedCategories.includes(job.category);
        const matchesLocation = job => selectedLocations.length === 0 || selectedLocations.includes(job.location);
        const matchesTitle = job => searchFilter.title === "" || job.title.toLowerCase().includes(searchFilter.title.toLowerCase());
        const matchesSearchLocation = job => searchFilter.location === "" || job.location.toLowerCase().includes(searchFilter.location.toLowerCase());
        
        // Salary Filter Function
        const matchesSalary = job => {
             const jobSalary = parseInt(job.salary, 10); 
             // Exclude jobs if salary is not a valid number
             if (isNaN(jobSalary)) return false; 
             // Handle cases where user might enter min > max by swapping them
             const currentMin = Math.min(minSalary, maxSalary); 
             const currentMax = Math.max(minSalary, maxSalary);
             // Check if job salary falls within the range
             return jobSalary >= currentMin && jobSalary <= currentMax;
        };

        // Apply all filters to the original jobs list
        const newFilteredJobs = jobs.filter(
            job => matchesCategory(job) && 
                   matchesLocation(job) && 
                   matchesTitle(job) && 
                   matchesSearchLocation(job) && 
                   matchesSalary(job) 
        ).reverse(); // Show newest matching jobs first

        setFilteredJobs(newFilteredJobs);
        setCurrentPage(1); // Reset to first page whenever filters change
    
    // Re-run this effect if any filter state changes
    }, [jobs, selectedCategories, selectedLocations, searchFilter, minSalary, maxSalary]);
    // --- End Filter Effect ---


    return (
        <div className='container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8'>
            
            {/* --- Sidebar --- */}
            <div className='w-full lg:w-1/4 bg-white px-4 '>
                
                {/* Current Search Display */}
                {isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
                    <div className='mb-6'> {/* Added margin bottom */}
                        <h3 className='font-medium text-lg mb-2'>Current Search</h3>
                        <div className='flex flex-wrap gap-2 text-gray-600 text-sm'> {/* Use flex-wrap */}
                            {searchFilter.title && (
                                <span className='inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 py-1 px-3 rounded-full'> {/* Adjusted padding/gap */}
                                    {searchFilter.title}
                                    <img 
                                        onClick={() => setSearchFilter(prev => ({ ...prev, title: "" }))} 
                                        className='cursor-pointer w-3 h-3' // Explicit size
                                        src={assets.cross_icon} 
                                        alt="Clear title" 
                                    />
                                </span>
                            )}
                            {searchFilter.location && (
                                <span className='inline-flex items-center gap-1.5 bg-red-50 border border-red-200 py-1 px-3 rounded-full'> {/* Adjusted padding/gap */}
                                    {searchFilter.location}
                                    <img 
                                        onClick={() => setSearchFilter(prev => ({ ...prev, location: "" }))} 
                                        className='cursor-pointer w-3 h-3' // Explicit size
                                        src={assets.cross_icon} 
                                        alt="Clear location" 
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Mobile Filter Toggle Button */}
                <button 
                    onClick={() => setShowFilter(prev => !prev)} 
                    className='px-6 py-1.5 rounded border border-gray-400 lg:hidden mb-4 w-full text-left' // Full width on mobile
                >
                    {showFilter ? "Hide Filters" : "Show Filters"}
                </button>

                {/* Filters Container (Toggles on mobile) */}
                <div className={`${showFilter ? 'block' : 'hidden'} lg:block space-y-8`}> {/* Added space-y */}
                
                    {/* Category Filter */}
                    <div> 
                        <h4 className='font-medium text-lg pb-4 border-b mb-4'>Search By Categories</h4> {/* Added border */}
                        <ul className='space-y-3 text-gray-700'> {/* Reduced space, changed color */}
                            {JobCategories.map((category, index) => (
                                <li className='flex gap-2 items-center' key={index}> {/* Reduced gap */}
                                    <input 
                                        className='w-4 h-4 accent-blue-600 cursor-pointer' // Standard size, accent color
                                        type="checkbox"
                                        id={`cat-${index}`} 
                                        onChange={() => handleCategoryChange(category)}
                                        checked={selectedCategories.includes(category)}
                                    />
                                    <label htmlFor={`cat-${index}`} className='cursor-pointer select-none text-sm'>{category}</label> {/* Label styling */}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Location Filter */}
                    <div> 
                        <h4 className='font-medium text-lg pb-4 border-b mb-4'>Search By Locations</h4> {/* Added border */}
                        <ul className='space-y-3 text-gray-700'> {/* Reduced space, changed color */}
                            {JobLocations.map((location, index) => (
                                <li className='flex gap-2 items-center' key={index}> 
                                    <input 
                                        className='w-4 h-4 accent-blue-600 cursor-pointer' // Standard size, accent color
                                        type="checkbox"
                                        id={`loc-${index}`}
                                        onChange={() => handleLocationChange(location)}
                                        checked={selectedLocations.includes(location)}
                                    />
                                    <label htmlFor={`loc-${index}`} className='cursor-pointer select-none text-sm'>{location}</label> {/* Label styling */}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Salary Range Filter */}
                    <div>
                        <h4 className='font-medium text-lg pb-4 border-b mb-4'>Filter by Salary (Annual)</h4> {/* Added border */}
                        <div className='flex flex-col gap-3 text-gray-700'> {/* Reduced gap */}
                            {/* Min Salary Input */}
                            <div>
                                <label htmlFor="minSalary" className='block text-sm mb-1 font-medium'>Min Salary (₹)</label>
                                <input 
                                    type="number" 
                                    id="minSalary"
                                    value={minSalary} 
                                    onChange={handleMinSalaryChange}
                                    min="0"
                                    step="50000" 
                                    placeholder='e.g., 300000'
                                    className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm' 
                                />
                            </div>
                            {/* Max Salary Input */}
                            <div>
                                <label htmlFor="maxSalary" className='block text-sm mb-1 font-medium'>Max Salary (₹)</label>
                                <input 
                                    type="number" 
                                    id="maxSalary"
                                    value={maxSalary} 
                                    onChange={handleMaxSalaryChange}
                                    min="0"
                                    step="100000" 
                                    placeholder='e.g., 1500000'
                                    className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm' 
                                />
                            </div>
                        </div>
                    </div>
                </div> 
            </div>
            {/* --- End Sidebar --- */}

            {/* --- Job Listing Section --- */}
            <section className='w-full lg:w-3/4 text-gray-800 max-lg:px-4 lg:pl-8'> {/* Added left padding */}
                <h3 className='font-medium text-2xl lg:text-3xl pt-2 pb-2' id='job-list'>
                    Latest Jobs <span className='text-gray-500 font-normal text-lg'>({filteredJobs.length} found)</span> {/* Show count */}
                </h3>
                <p className='mb-8 text-gray-600'>Get Your Desired Jobs from top Companies....</p> 
                
                {/* No Jobs Found Message */}
                {filteredJobs.length === 0 && (
                    <div className='text-center text-gray-500 mt-16 p-6 border rounded-lg bg-gray-50'>
                        <p className='text-lg font-medium'>No jobs found matching your criteria.</p>
                        <p className='text-sm mt-1'>Try adjusting the filters in the sidebar!</p>
                    </div>
                )}

                {/* Job Cards Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                    {filteredJobs.slice((currentPage - 1) * 6, currentPage * 6).map((job) => (
                        <JobCard key={job._id || job.title} job={job}></JobCard> // Use _id if available
                    ))}
                </div>
                
                {/* Pagination */}
                {filteredJobs.length > 6 && ( // Show only if needed
                    <div className='flex items-center justify-center mt-12 space-x-2'> {/* Increased top margin */}
                        {/* Left Arrow Button */}
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1} 
                            className='p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
                            aria-label="Previous Page" // Accessibility
                        >
                            <a href="#job-list">
                                <img src={assets.left_arrow_icon} alt="Previous" className='w-5 h-5'/>
                            </a>
                        </button>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.ceil(filteredJobs.length / 6) }).map((_, index) => (
                            <a key={index} href="#job-list">
                                <button 
                                    onClick={() => setCurrentPage(index + 1)} 
                                    className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded text-sm ${
                                        currentPage === index + 1 
                                        ? 'bg-blue-600 text-white font-semibold border-blue-600' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`} 
                                >
                                    {index + 1}
                                </button>
                            </a>
                        ))}

                        {/* Right Arrow Button */}
                         <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredJobs.length / 6)))}
                            disabled={currentPage === Math.ceil(filteredJobs.length / 6)} 
                            className='p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed'
                            aria-label="Next Page" // Accessibility
                        >
                           <a href="#job-list">
                                <img src={assets.right_arrow_icon} alt="Next" className='w-5 h-5'/>
                            </a>
                        </button>
                    </div>
                )}
            </section>
            {/* --- End Job Listing Section --- */}
        </div>
    );
}

export default JobListing;