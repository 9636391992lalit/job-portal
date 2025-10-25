import mongoose from "mongoose";
const UserSchema=new mongoose.Schema({
    _id: {type:String, required:true},
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    resume:{type:String},
    image:{type:String, required:true},
    savedJobs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Job'}],
    headline: { type: String, default: '' }, // e.g., "Software Engineer | React Developer"
    location: { type: String, default: '' },
    skills: [{ type: String }], // Array of strings
    experience: [{ // Array of objects
        company: String,
        title: String,
        years: String // e.g., "2020-2022" or "2 years"
    }],
    education: [{ // Array of objects
        institution: String,
        degree: String,
        year: String // e.g., "2016-2020"
    }],
    portfolioLink: { type: String, default: '' },
    linkedinLink: { type: String, default: '' }
})

const User=mongoose.model('User',UserSchema)
export default User;