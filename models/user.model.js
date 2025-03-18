import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name:{type:String, required:true},
    phone:{type:Number, required:true, unique:true},
    profilePic:{type:String},
    vehicle:{type:String, set: (value) => value.toUpperCase()},
    password:{type:String, required:true},
    role:{type:String, required:true, enum:['user','admin', 'worker'], default:'user'},
    admin:{type:Boolean, required:true, default:false},

}, {timestamps:true});

const User = mongoose.model('User', userSchema);

export default User;