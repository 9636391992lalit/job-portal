import Company from '../models/Company.js';
import PendingCompany from '../models/PendingCompany.js'; // Import PendingCompany
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import generateToken from '../utils/generateToken.js'; // Assuming this utility exists and works
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import { io } from '../server.js';
// --- Register a new Company (saves to Pending) ---
export const registerCompany = async (req, res) => {
    const { name, email, password, website, domain, cin } = req.body;
    const imageFile = req.file;

    // Validate all required fields
    if (!name || !email || !password || !website || !domain || !cin || !imageFile) {
        return res.status(400).json({ success: false, message: "Missing required details" });
    }

    // Basic URL validation (optional but recommended)
    try {
        new URL(website);
    } catch (_) {
        return res.status(400).json({ success: false, message: "Invalid website URL format (e.g., https://example.com)" });
    }

    try {
        // Check for duplicates in both main and pending collections
        const existingCompany = await Company.findOne({ $or: [{ email }, { cin }, { domain }] });
        const pendingCompany = await PendingCompany.findOne({ $or: [{ email }, { cin }, { domain }] });

        if (existingCompany || pendingCompany) {
            let message = "Registration failed: ";
            if ((existingCompany?.email === email) || (pendingCompany?.email === email)) message += "Email already exists. ";
            if ((existingCompany?.cin === cin) || (pendingCompany?.cin === cin)) message += "CIN already registered. ";
            if ((existingCompany?.domain === domain) || (pendingCompany?.domain === domain)) message += "Domain already registered. ";
            return res.status(400).json({ success: false, message: message.trim() });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Upload image
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            folder: "company_logos", // Optional: organize uploads
            // transformation: [{ width: 200, height: 200, crop: "limit" }] // Optional: resize image
        });

        // Create entry in PendingCompany collection
        await PendingCompany.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url,
            website,
            domain,
            cin,
        });

        // Send success message, NO TOKEN
        res.status(201).json({
            success: true,
            message: "Registration successful! Your account is pending admin approval."
        });

    } catch (error) {
        console.error("Error during company registration submission:", error);
        // Handle potential Cloudinary upload errors specifically if needed
        if (error.http_code && error.http_code >= 400) {
            return res.status(500).json({ success: false, message: "Image upload failed. Please try again." });
        }
        res.status(500).json({ success: false, message: "Registration failed due to a server error. Please try again." });
    }
};

// --- Login Company (Checks Status) ---
export const loginCompany = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    try {
        const company = await Company.findOne({ email });

        // Check if company exists in the main collection
        if (!company) {
            // If not found, check if they are still pending approval
            const pending = await PendingCompany.findOne({ email });
            if (pending) {
                return res.status(401).json({ success: false, message: "Account is pending admin approval." });
            }
            // If not in pending either, the email is not registered
            return res.status(404).json({ success: false, message: "Company email not registered." });
        }

        // --- Check Company Status ---
        if (company.status !== 'Approved') {
            if (company.status === 'Pending') { // This case should ideally not happen with the new flow, but good safety check
                return res.status(401).json({ success: false, message: "Account is still pending admin approval." });
            }
            if (company.status === 'Rejected') {
                return res.status(401).json({ success: false, message: "Your account registration was rejected." });
            }
            // Handle any other potential statuses
            return res.status(401).json({ success: false, message: "Account not active or approved." });
        }
        // ---------------------------------

        // Check password
        const isMatch = await bcrypt.compare(password, company.password);
        if (isMatch) {
            // Password matches, status is Approved - generate token
            res.json({
                success: true,
                company: { // Send only necessary, non-sensitive data
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image,
                    isVerified: company.isVerified // Good to send verification status
                },
                token: generateToken(company._id) // Generate JWT token
            });
        } else {
            // Password does not match
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Error during company login:", error);
        res.status(500).json({ success: false, message: "Login failed due to a server error. Please try again." });
    }
};


export const updateCompanyProfile = async (req, res) => {
    try {
        // 1. Get company ID from the token (provided by protectCompany middleware)
        console.log(req);
        const companyId = req.company._id;

        // 2. Get the new data from the request body
        const { description, industry, location, companySize } = req.body;

        // 3. Find the company
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found." });
        }

        // 4. Update the fields
        if (description !== undefined) company.description = description;
        if (industry !== undefined) company.industry = industry;
        if (location !== undefined) company.location = location;
        if (companySize !== undefined) company.companySize = companySize;

        // 5. Save the updated company
        await company.save();

        // 6. Send back the updated company data (this updates the frontend context)
        const updatedCompanyData = {
            _id: company._id,
            name: company.name,
            email: company.email,
            image: company.image,
            website: company.website,
            domain: company.domain,
            isVerified: company.isVerified,
            status: company.status,
            description: company.description,
            industry: company.industry,
            location: company.location,
            companySize: company.companySize
        };

        res.json({
            success: true,
            message: "Profile updated successfully!",
            company: updatedCompanyData
        });

    } catch (error) {
        console.error("Error updating company profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// --- Get Logged-in Company Data ---
export const getPublicCompanyProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch Company Public Details
        // We use .select() to EXCLUDE sensitive data
        const company = await Company.findById(id)
            .select('name image website description industry location companySize');

        if (!company) {
            return res.json({ success: false, message: "Company not found." });
        }

        // 2. Fetch all VISIBLE jobs for this company
        const jobs = await Job.find({ companyId: id, visible: true })
            .populate('companyId', 'name image') // We still need companyId for JobCard
            .sort({ date: -1 });

        // 3. Calculate Hiring & Activity Stats (Your Unique Feature!)
        const totalApplications = await JobApplication.countDocuments({ companyId: id });
        const totalHires = await JobApplication.countDocuments({
            companyId: id,
            status: 'Accepted'
        });

        // This stat is great for users: it shows if the company is active
        const totalResponded = await JobApplication.countDocuments({
            companyId: id,
            status: { $in: ['Accepted', 'Rejected'] } // Count all "final" decisions
        });

        const responseRate = (totalApplications > 0)
            ? Math.round((totalResponded / totalApplications) * 100)
            : 0; // Avoid dividing by zero

        // Send all the data back
        res.json({
            success: true,
            company: company,
            jobs: jobs,
            stats: {
                totalJobs: jobs.length,
                totalHires: totalHires, // "how much of the people get hired"
                responseRate: responseRate  // "Application Response Rate"
            }
        });

    } catch (error) {
        console.error("Error fetching public company profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
export const getCompanyData = async (req, res) => {
    try {
        // req.company is attached by the protectCompany middleware
        const company = req.company;

        if (!company) {
            // This case might happen if the token is valid but the company was deleted
            return res.status(404).json({ success: false, message: "Company data not found for this token." });
        }

        // Return relevant, non-sensitive company details
        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image,
                website: company.website,
                domain: company.domain,
                // Maybe add description, industry, companySize, hqLocation later
                isVerified: company.isVerified,
                status: company.status, // Good to know the status
                createdAt: company.createdAt, // Timestamps can be useful
                updatedAt: company.updatedAt
            }
        });
    } catch (error) {
        console.error("Error fetching company data:", error);
        res.status(500).json({ success: false, message: "Failed to fetch company data." });
    }
};

// --- Post a new Job (Checks Status) ---
export const postJob = async (req, res) => {
    // --- Check Company Status ---
    // Ensure the company making the request is approved
    if (req.company?.status !== 'Approved') {
        return res.status(403).json({ success: false, message: "Your company account is not approved to post jobs." });
    }
    // ---------------------------------

    const { title, description, location, salary, level, category } = req.body;
    const companyId = req.company._id; // Get ID from the authenticated company object

    // Validate required fields
    if (!title || !description || !location || !salary || !level || !category) {
        return res.status(400).json({ success: false, message: "Missing required job details." });
    }
    // Basic salary validation
    const parsedSalary = parseInt(salary, 10);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
        return res.status(400).json({ success: false, message: "Invalid salary amount. Must be a non-negative number." });
    }

    try {
        const newJob = await Job.create({
            title,
            description,
            location,
            salary: parsedSalary, // Save the parsed number
            companyId,
            date: Date.now(),
            level,
            category
            // 'visible' defaults to true in the Job model
        });
        // --- NEW: Emit the event after successful creation ---
        // We need to populate company details before sending to clients
        const jobToSend = await Job.findById(newJob._id).populate('companyId', 'name image isVerified'); // Populate necessary fields
        if (jobToSend) {
            io.emit('newJobPosted', jobToSend); // Send the newly created job data to ALL connected clients
            console.log(`🚀 Emitted newJobPosted: ${jobToSend.title}`);
        }
        res.status(201).json({ success: true, message: "Job posted successfully!", newJob });
    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({ success: false, message: "Failed to post job. Please try again." });
    }
};

// --- Get Company Job Applicants ---
export const getCompanyJobApplicants = async (req, res) => {
    // Ensure company is approved before showing applicants
    if (req.company?.status !== 'Approved') {
        return res.status(403).json({ success: false, message: "Account not approved to view applicants." });
    }
    try {
        const companyId = req.company._id;
        // Find job applications linked to this company
        // Populate user details (select only needed fields) and job details
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image email resume headline location skills experience education portfolioLink linkedinLink') // Select specific user fields
            .populate('jobId', 'title location') // Select specific job fields
            .sort({ date: -1 }) // Show newest applications first
            .exec();

        // It's okay if applications is an empty array, not an error
        return res.json({ success: true, applications });
    } catch (error) {
        console.error("Error fetching job applicants:", error);
        res.status(500).json({ success: false, message: "Failed to fetch applicants." });
    }
};

// --- Get Company Posted Jobs ---
export const getCompanyPostedJobs = async (req, res) => {
    // Ensure company is approved
    if (req.company?.status !== 'Approved') {
        return res.status(403).json({ success: false, message: "Account not approved to view jobs." });
    }
    try {
        const companyId = req.company._id;
        // Find jobs posted by this company
        const jobs = await Job.find({ companyId }).sort({ date: -1 }); // Sort by newest first

        // Add applicant count to each job
        // Using Promise.all is good for performance if applicant count logic is complex,
        // but can be simplified if counts are not strictly needed immediately or are large.
        // Consider a more optimized approach for large numbers of jobs/applicants later.
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicantsCount = await JobApplication.countDocuments({ jobId: job._id });
            return { ...job.toObject(), applicants: applicantsCount }; // Use countDocuments
        }));

        res.json({ success: true, jobsData });
    } catch (error) {
        console.error("Error fetching company posted jobs:", error);
        res.status(500).json({ success: false, message: "Failed to fetch posted jobs." });
    }
};

// --- Change Job Application Status ---
export const ChangeJobApplicationsStatus = async (req, res) => {
    // Ensure company is approved
    if (req.company?.status !== 'Approved') {
        return res.status(403).json({ success: false, message: "Account not approved to change status." });
    }
    try {
        const { id, status } = req.body; // id is the JobApplication _id
        const companyId = req.company._id;

        if (!id || !status) {
            return res.status(400).json({ success: false, message: "Application ID and status are required." });
        }

        // Validate the status value
        const validStatuses = ['Pending', 'Viewed', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected']; // Add more as needed
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value provided." });
        }

        // Find the application and ensure it belongs to the logged-in company
        const updatedApplication = await JobApplication.findOneAndUpdate(
            { _id: id, companyId: companyId }, // Match both ID and companyId for security
            { status: status },
            { new: true } // Return the updated document
        );

        if (!updatedApplication) {
            return res.status(404).json({ success: false, message: 'Application not found or you do not have permission to modify it.' });
        }

        // Optional: Notify the user about the status change via email or notification system

        res.json({ success: true, message: 'Application status updated successfully.' });

    } catch (error) {
        console.error("Error changing application status:", error);
        res.status(500).json({ success: false, message: "Failed to change status." });
    }
};

// --- Change Job Visibility ---
export const changeVisiblity = async (req, res) => {
    // Ensure company is approved
    if (req.company?.status !== 'Approved') {
        return res.status(403).json({ success: false, message: "Account not approved to change job visibility." });
    }
    try {
        const { id } = req.body; // id is the Job _id
        const companyId = req.company._id;

        if (!id) {
            return res.status(400).json({ success: false, message: "Job ID is required." });
        }

        // Find the job and ensure it belongs to the logged-in company
        const job = await Job.findOne({ _id: id, companyId: companyId });

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or you do not have permission to modify it.' });
        }

        // Toggle visibility
        job.visible = !job.visible;
        await job.save();

        res.json({ success: true, message: `Job visibility set to ${job.visible}.`, job });

    } catch (error) {
        console.error("Error changing job visibility:", error);
        res.status(500).json({ success: false, message: "Failed to change visibility." });
    }
};