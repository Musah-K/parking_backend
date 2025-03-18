import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const userResolvers = {
    Query:{
        authUser: async(_,__,context)=>{
            try {
                const user  = context.getUser();
                return user;
            } catch (error) {
                console.log(error.message)
                throw new Error(error.message);                
            }
        },

        user: async(_,{_id, phone})=>{
            try {
                
               const user = phone ? await User.findOne({phone}): await User.findById(_id);
                return user;
            } catch (error) {
                console.log(error.message)
                throw new Error(error.message);
            }
        },

        allUsers: async()=>{
            try {
                const users = await User.find({});
                return users;
            } catch (error) {
                console.log(error)
                throw new Error(error.message);
            }
        }

    },
    Mutation:{
        createUser: async(_,{input}, context)=>{
            try {
                const userExist = await User.findOne({phone: input.phone});
                if(userExist){
                    throw new Error("User already exist");
                };
                const hashedPassword = await bcrypt.hash(input.password, 10);
                const user = new User({...input, password:hashedPassword});
                await user.save();

                await context.login(user);
                
                return user;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        loginUser: async (_, { input }, context) => {
            try {
                
                const existingUser = await User.findOne({ phone: input.phone });
                if (!existingUser) {
                    console.log("User not found in database.");
                    throw new Error("User not founk.");
                }
                const { user, info } = await context.authenticate("graphql-local", { username: input.phone.toString(), password: input.password });
        
                if (!user) {
                    console.log("Authentication failed:", info);
                    throw new Error("Invalid login credentials");
                }
        
                await context.login(user);
                return user;
            } catch (error) {
                console.error("Login error:", error.message);
                throw new Error(error.message);
            }
        },
        
        

        updateUser: async(_,{_id,input}, context)=>{
            try {
                const {name, phone, password, role, profilePic, admin} = input;
                
                if(!context.isAuthenticated()) throw new Error("User not authenticated");
                const user = context.getUser();
                if (!user) throw new Error("User not found");

                let hashedPassword;
                if(password){
                    hashedPassword = await bcrypt.hash(password, 10);
                    user.password = hashedPassword;
                };

                const updateFields = { name, phone, role, profilePic, admin };
                if (password) updateFields.password = hashedPassword;

                const updatedUser = await User.findByIdAndUpdate(_id, updateFields, { new: true });
                return updatedUser;

            } catch (error) {
                throw new Error(error.message);
            }
        },

        deleteUser: async(_,{_id}, context)=>{
            try {
                if(!context.isAuthenticated()) throw new Error("User not authenticated");
                const user = context.getUser();
                if (!user) throw new Error("User not found");

                const deletedUser = await User.findByIdAndDelete(_id);
                return deletedUser;
            } catch (error) {
                throw new Error(error.message);
            }
        },

        logout: async(_,__,context)=>{
            try {
                context.logout();
                context.req.session.destroy(err=>{
                    if(err) throw new Error(err.message);
                } );
                context.res.clearCookie("connect.sid");

                return {message:"User logged out successfully"};
            } catch (error) {
                throw new Error(error.message);
            }
        },
    }
};

export default userResolvers;