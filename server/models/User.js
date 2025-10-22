import mongoose from "mongoose";
const UserSchema=new mongoose.Schema({
    _id: {type:String, required:true},
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    resume:{type:String},
    image:{type:String, required:true},
    savedJobs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Job'}]
})

const User=mongoose.model('User',UserSchema)
export default User;