
const parkingSlotTypedef = `#graphql
type ParkingSlot {
    _id:ID!
    slotNumber:Int!
    isAvailable:Boolean
    paymentId: ID
    bookedBy:User
    validFrom:String
    validTill:String
    createdAt:String!
    mpesa: String
}

type Query {
    parkingSlot(slotNumber:Int!):ParkingSlot
    allParkingSlots:[ParkingSlot!]!
    availableSlots(available:Boolean!):[ParkingSlot!]!
    userSlots:[ParkingSlot!]!
}

type Mutation {
    createParkingSlot: [ParkingSlot!]!
    updateParkingSlot(_id:ID!,input:updateParkingSlotInput!): ParkingSlot!
    deleteParkingSlot(_id:ID!): deleteResponse!
    removeExpiredSlots:UpdateResponse!
    
}


input createParkingSlotInput {
    slotNumber: Int!
    isAvailable: Boolean
    bookedBy: ID
    validTill: String
    validFrom: String
}

input updateParkingSlotInput {
    isAvailable: Boolean
    bookedBy: ID
    validTill: String
    validFrom: String
    mpesa: String
}

type deleteResponse {
    message: String!
}

type UpdateResponse {
    acknowledged: Boolean!
    matchedCount: Int!
    modifiedCount: Int!
}

`

export default parkingSlotTypedef;