import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const userResolvers = {
  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = context.getUser();
        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    user: async (_, { _id, phone }) => {
      try {
        const user = phone
          ? await User.findOne({ phone })
          : await User.findById(_id);
        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    allUsers: async () => {
      try {
        const users = await User.find({});
        return users;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    createUser: async (_, { input }, context) => {
      try {
        const userExist = await User.findOne({ phone: input.phone });
        if (userExist) {
          throw new Error("User already exist");
        }
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const user = new User({ ...input, password: hashedPassword });
        await user.save();

        await context.login(user);

        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    adminCreateUser: async(_, {input})=>{
      try {

        const userExist = await User.findOne({ phone: input.phone });
        if (userExist) {
          throw new Error("User already exist");
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        const user = new User({ ...input, password: hashedPassword });
        await user.save();
        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    loginUser: async (_, { input }, context) => {
      try {
        const existingUser = await User.findOne({ phone: input.phone });
        if (!existingUser) {
          throw new Error("User not found.");
        }
        const { user, info } = await context.authenticate("graphql-local", {
          username: input.phone.toString(),
          password: input.password,
        });

        if (!user) {
          throw new Error("Invalid login credentials");
        }

        await context.login(user);
        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    updateUser: async (_, { _id, input }, context) => {
      try {
        const { name, phone, password, role, profilePic, admin, oldPassword } = input;
    
        if (!context.isAuthenticated())
          throw new Error("User not authenticated");
        const user = context.getUser();
        if (!user) throw new Error("User not found");
    
        const updateFields = {};
    
        if (name && name.trim() !== "") updateFields.name = name;
        if (phone && phone.toString().trim() !== "") updateFields.phone = phone;
        if (role && role.trim() !== "") updateFields.role = role;
        if (profilePic && profilePic.trim() !== "") updateFields.profilePic = profilePic;
        if (admin !== undefined && admin !== null) updateFields.admin = admin;
    
        if (password && password.trim() !== "") {
          if (!oldPassword || oldPassword.trim() === "") {
            throw new Error("Old password is required to update your password.");
          }
          const comparePassword = await bcrypt.compare(oldPassword, user.password);
          if (!comparePassword) throw new Error("Old password does not match.");
          const hashedPassword = await bcrypt.hash(password, 10);
          updateFields.password = hashedPassword;
        }
    
        if (Object.keys(updateFields).length === 0) {
          return user;
        }
    
        const updatedUser = await User.findByIdAndUpdate(_id, updateFields, {
          new: true,
        });
        return updatedUser;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    
    adminUpdateUser: async (_, { input }, context) => {
      try {
        const user = context.getUser();
        if (!user.admin || user.role !== "admin") {
          throw new Error("Not authorised. Admin required.");
        }

        if (!input._id) {
          throw new Error("User ID is required.");
        }

        const updatedUser = await User.findByIdAndUpdate(input._id, input, {
          new: true,
        });

        if (!updatedUser) throw new Error("User not found.");

        return updatedUser;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    deleteUser: async (_, { _id }, context) => {
      try {
        if (!context.isAuthenticated())
          throw new Error("User not authenticated");
        const user = context.getUser();
        if (!user) throw new Error("User not found");

        const deletedUser = await User.findByIdAndDelete(_id);
        return deletedUser;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    logout: async (_, __, context) => {
      try {
        // Use the callback form of logout to allow Passport to finish its work.
        await new Promise((resolve, reject) => {
          // Check if req.session exists before calling logout
          if (context.req.session) {
            context.req.logout((err) => {
              if (err) return reject(new Error(err.message));
              // Now safely destroy the session if it exists
              context.req.session.destroy((err) => {
                if (err) return reject(new Error(err.message));
                // Clear the session cookie
                context.res.clearCookie("connect.sid");
                resolve();
              });
            });
          } else {
            // If there is no session, just clear the cookie.
            context.res.clearCookie("connect.sid");
            resolve();
          }
        });

        return { message: "User logged out successfully" };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

export default userResolvers;
