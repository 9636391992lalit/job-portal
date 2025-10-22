import express from 'express'
import {getUserData,applyForJob,getUserJobApplication,updateUserResume,getSavedJobs,toggleSaveJob} from '../controllers/userControllers.js'
import  upload from '../config/multer.js'
const router=express.Router()
// Get user Data
router.get('/user',getUserData)

//Apply for a job
router.post('/apply',applyForJob)

//Get applied jobs data

router.get('/applications',getUserJobApplication)


//Update user profile resume
router.post('/update-resume',upload.single('resume'),updateUserResume)
router.get('/saved-jobs', getSavedJobs);
router.post('/save-job', toggleSaveJob);
export default router;