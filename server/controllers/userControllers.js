//Get user data
import User from "../models/User.js"
import { getAuth } from "@clerk/express";
import JobApplication from "../models/JobApplication.js"
import { v2 as cloudinary } from "cloudinary"
import Job from "../models/Job.js"
export const getUserData = async (req, res) => {
    const { userId } = req.auth();   // Clerk userId (string)
    try {
        console.log('User Id is from login user', userId)
        const user = await User.findById(userId)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }

}
// Apply for a job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body
    const userId = req.auth.userId
    try {
        const isAlreadyApplied = await JobApplication.findOne({ jobId, userId })
        if (isAlreadyApplied) {
            return res.json({ success: false, message: 'Alredy Applied' })
        }

        const jobData = await Job.findById(jobId)
        if (!jobData) {
            return res.json({ success: false, message: 'Job Not found' })
        }
        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })
        res.json({ success: true, message: 'Applied Successfully' })
    }
    catch (error) {
        res.json({
            success: false, message: error.message
        })
    }

}

//Get user applied application
export const getUserJobApplication = async (req, res) => {
    try {
        const userId = req.auth.userId
        const applications = await JobApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('jobId', 'title description location category level salary').
            exec()
        if (!applications) {
            return res.json({ success: false, message: 'No job application form for this user. ' })
        }
        return res.json({ success: true, applications })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
// Update user profile (resume)
export const updateUserResume = async (req, res) => {
    try {
        const userId = req.auth.userId
        const resumeFile = req.file

        const userData = await User.findById(userId)
        const oldResumeUrl = userData.resume;
        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            console.log(resumeUpload.secure_url)
            userData.resume = resumeUpload.secure_url

        }
        await userData.save()
        if (oldResumeUrl) {
            const publicId = oldResumeUrl.split('/').pop().split('.')[0];
            const fileParts = oldResumeUrl.split('/');
            const publicIdWithFolder = fileParts.slice(-2).join('/').split('.')[0];
            try {
                // Use 'raw' resource_type for non-image files like PDFs
                await cloudinary.uploader.destroy(publicIdWithFolder, { resource_type: 'raw' });
            } catch (delError) {
                console.error("Failed to delete old resume:", delError.message);
            }
        }
        return res.json({ success: true, message: 'Resume Updated' })
    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const toggleSaveJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const { userId } = getAuth(req); // Clerk se user ID

        if (!jobId) {
            return res.status(400).json({ success: false, message: 'Job ID is required' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check karein ki job already saved hai ya nahi
        const jobIndex = user.savedJobs.indexOf(jobId);

        if (jobIndex > -1) {
            // Agar already saved hai, toh array se nikaal dein (Unsave)
            user.savedJobs.pull(jobId);
            await user.save();
            res.json({ success: true, message: 'Job removed from saved list' });
        } else {
            // Agar saved nahi hai, toh array mein add kar dein (Save)
            user.savedJobs.push(jobId);
            await user.save();
            res.json({ success: true, message: 'Job saved successfully!' });
        }

    } catch (error) {
        console.error("Error in toggleSaveJob:", error);
        res.status(500).json({ success: false, message: "Server error, please try again." });
    }
};

// <-- NEW: User ke saare saved jobs laane ka logic -->
export const getSavedJobs = async (req, res) => {
    try {
        const { userId } = getAuth(req); // Clerk se user ID

        // User ko find karein aur 'savedJobs' field ko populate karein
        // Populate se humein sirf ID nahi, poori job details mil jayengi
        const user = await User.findById(userId).populate({
            path: 'savedJobs',
            populate: {
                path: 'companyId', // Har job ke saath uski company details bhi laayein
                select: '-password' // Security ke liye company ka password na laayein
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Saved jobs ko reverse order mein bhejein (latest sabse pehle)
        const savedJobs = user.savedJobs.reverse();
        res.json({ success: true, savedJobs });

    } catch (error) {
        console.error("Error in getSavedJobs:", error);
        res.status(500).json({ success: false, message: "Server error, please try again." });
    }
};