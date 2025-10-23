// controllers/adminController.js
import PendingCompany from '../models/PendingCompany.js';
import Company from '../models/Company.js'; // Import the main Company model
import Admin from '../models/Admin.js'; // <-- Import Admin model
import bcrypt from 'bcrypt';          // <-- Import bcrypt
import generateAdminToken from '../utils/generateAdminToken.js';
// Fetch all companies awaiting approval
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    try {
        // Find admin user by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid admin credentials." }); // Use 401 Unauthorized
        }

        // Compare provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid admin credentials." }); // Use 401 Unauthorized
        }

        // Passwords match - Generate JWT token for admin session
        const token = generateAdminToken(admin._id); // Generate a token (you'll need this utility)

        res.json({
            success: true,
            message: "Admin login successful!",
            token: token // Send the token back to the frontend
        });

    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ success: false, message: "Admin login failed. Please try again." });
    }
};
export const getPendingCompanies = async (req, res) => {
    try {
        // Fetch pending companies, maybe sort by submission date
        const pendingList = await PendingCompany.find().sort({ submittedAt: 1 }); // Oldest first
        res.json({ success: true, pendingCompanies: pendingList });
    } catch (error) {
        console.error("Error fetching pending companies:", error);
        res.json({ success: false, message: "Failed to fetch pending companies." });
    }
};

// Approve a company registration
export const approveCompany = async (req, res) => {
    const { pendingId } = req.params; // Get ID from URL parameter

    try {
        const pendingData = await PendingCompany.findById(pendingId);

        if (!pendingData) {
            return res.json({ success: false, message: "Pending company not found." });
        }

        // Check if company with same email/cin/domain somehow got created in main collection already
         const existingCompany = await Company.findOne({ $or: [{ email: pendingData.email }, { cin: pendingData.cin }, { domain: pendingData.domain }] });
         if (existingCompany) {
             // Maybe just delete the pending one if a real one exists now
             await PendingCompany.findByIdAndDelete(pendingId);
             return res.json({ success: false, message: "Company with this email/CIN/domain already exists in main collection. Pending entry removed." });
         }


        // Create a new entry in the main Company collection
        await Company.create({
            name: pendingData.name,
            email: pendingData.email,
            password: pendingData.password, // Use the already hashed password
            image: pendingData.image,
            website: pendingData.website,
            domain: pendingData.domain,
            cin: pendingData.cin,
            isVerified: true, // Mark as verified upon approval
            status: 'Approved'   // Set status to Approved
        });

        // Delete the entry from PendingCompany collection
        await PendingCompany.findByIdAndDelete(pendingId);

        res.json({ success: true, message: `Company '${pendingData.name}' approved and moved to main collection.` });

    } catch (error) {
        console.error("Error approving company:", error);
        res.json({ success: false, message: "Failed to approve company." });
    }
};

// Reject a company registration
export const rejectCompany = async (req, res) => {
    const { pendingId } = req.params;

    try {
        const deletedPending = await PendingCompany.findByIdAndDelete(pendingId);

        if (!deletedPending) {
            return res.json({ success: false, message: "Pending company not found." });
        }

        // Optional: Notify the company via email that their registration was rejected.

        res.json({ success: true, message: `Company registration for '${deletedPending.name}' rejected and removed.` });

    } catch (error) {
        console.error("Error rejecting company:", error);
        res.json({ success: false, message: "Failed to reject company." });
    }
};