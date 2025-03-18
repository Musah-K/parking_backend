import ParkingSlot from "../models/parkingSlots.model.js";

const parkingSlotsResolvers = {
    Query:{
        parkingSlot:async(_,{slotNumber})=>{
            try {
                const slot = await ParkingSlot.findOne({slotNumber});
                if(!slot) throw new Error("Parking Slot not found");
                return slot;
                
            } catch (error) {
                throw new Error(error.message)
            }
        },
        allParkingSlots:async()=>{
            try {
                const slots = await ParkingSlot.find({});
                if(!slots) throw new Error("No parking slots found");
                return slots;
                
            } catch (error) {
                throw new Error(error.message)
            }
        },

        availableSlots:async(_,{available})=>{
            try {
                const slots = await ParkingSlot.find({isAvailable:available});
                if(!slots) throw new Error(`No ${available? "available": "booked"} parking slots found`);
                return slots;   
            } catch (error) {
                throw new Error(error.message)    
            }
        },
        userSlots: async(_, __, context)=>{
            try {
                const user = await context.getUser();
                const reservedSpaces = await ParkingSlot.find({bookedBy: user._id});
                return reservedSpaces;
                
            } catch (error) {
                throw new Error(error.message)
            }
        }

    },
    Mutation:{
        createParkingSlot: async(_,__,context)=>{

            try {
                // const user = await context.getUser();
                // if(!user) throw new Error("Unauthorized");

                // const arr = [];
                // arr.length = 50
                // const slots = Array.from(arr,(_,i)=>{ 
                //     return {slotNumber:i+1}}
                // )
                // const newSlots = await ParkingSlot.insertMany(slots);      
                // return newSlots;
                
            } catch (error) {
                throw new Error(error.message)
            }
        },

        updateParkingSlot:async(_,{_id,input},context)=>{
            try {
                const user = await context.getUser();
                if(!user || !user.admin) throw new Error("Unauthorized");
                const updatedPArkingSlot = await ParkingSlot.findByIdAndUpdate(_id,input,{new:true});
                if(!updatedPArkingSlot) throw new Error("Parking Slot not updated");
                return updatedPArkingSlot;
            } catch (error) {
                throw new Error(error.message)
            }
        },

        deleteParkingSlot: async(_,{_id},context)=>{
            try {
                const user = await context.getUser();
                if(!user || !user.admin) throw new Error("Unauthorized");
                const deletedParkingSlot = await ParkingSlot.findByIdAndDelete(_id);
                if(!deletedParkingSlot) throw new Error("Parking Slot not deleted");
                return {message:"Parking Slot deleted"};
            } catch (error) {
                throw new Error(error.message)
            }
        },
        removeExpiredSlots: async()=>{
            try {
                const now = new Date().toISOString().split('T')[0];
                const update = await ParkingSlot.updateMany({validTill: {$lt: now}, isAvailable: false},{
                    $set:{
                        isAvailable: true,
                        bookedBy: null,
                        paymentId: null,
                        validFrom: null,
                        validTill: null,
                    }
                })

                return update
            } catch (error) {
                throw new Error(error.message)
                
            }
        },

    }
}

export default parkingSlotsResolvers;