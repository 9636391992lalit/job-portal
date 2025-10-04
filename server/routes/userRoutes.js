import express from 'express'
import {getUserData,applyForJob,getUserJobApplication,updateUserResume} from '../controllers/userControllers.js'
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

export default router;