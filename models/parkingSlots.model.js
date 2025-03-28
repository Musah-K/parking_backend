import mongoose from "mongoose";

const parkingSlotSchema = mongoose.Schema({
    slotNumber:{type:Number,required:true},
    isAvailable:{type:Boolean,required:true, default:true},
    paymentId:{type:mongoose.Schema.Types.ObjectId,ref:"Payment"},
    bookedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    mpesa:{ String},
    validFrom:{type:Date},
    validTill:{type:Date},
},{timestamps: true});

const ParkingSlot = mongoose.model("ParkingSlot", parkingSlotSchema);

export default ParkingSlot;