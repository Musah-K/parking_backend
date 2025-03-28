
const userTypedef = `#graphql
type User {
    _id:ID!
    name:String
    phone:Int!
    profilePic:String
    password:String!
    admin:Boolean
    vehicle:String
    role:String
    createdAt:String!
    updatedAt:String!
}

type Query {
    user(phone:Int, _id:ID):User
    allUsers:[User!]!
    authUser:User
}

type Mutation {
    createUser(input:createUserInput!): User
    adminCreateUser(input:createUserInput!): User
    loginUser(input:loginUserInput!): User
    updateUser(_id:ID!,input:updateUserInput!): User
    adminUpdateUser(input:adminUpdateUserInput!): User
    deleteUser(_id:ID!): User
    logout: logoutResponse!
}

input createUserInput {
    name:String!
    phone:Int!
    profilePic:String
    password:String!
    vehicle:String
    role:String
}

input loginUserInput {
    phone:Int!
    password:String!
}

input updateUserInput {
    name:String
    phone:Int
    profilePic:String
    password:String
    vehicle:String
    role:String
    admin:Boolean
    oldPassword:String
}
input adminUpdateUserInput {
    _id:ID!
    name:String
    phone:Int
    profilePic:String
    password:String
    admin:Boolean
    vehicle:String
    role:String 
}

type logoutResponse {
    message:String!
}

`

export default userTypedef;