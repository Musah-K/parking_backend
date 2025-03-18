import passport from "passport";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { GraphQLLocalStrategy } from "graphql-passport";

const configPassport = ()=>{
    passport.serializeUser((user, done)=>{
        done(null, user._id);
    });

    passport.deserializeUser(async(_id, done)=>{
        try {
            const user = await User.findById(_id);
            if(!user)return done(null, false)

                done(null, user)
        } catch (error) {
            done(error)
            
        }
    });
}

passport.use(
    new GraphQLLocalStrategy({ usernameField: "username" },async(username, password, done)=>{
        try {
            console.log("GraphQL Passport received:", { username, password });
            const phone = Number(username);

            const user = await User.findOne({phone});

            if(!user) return done(null, false, {message:phone});

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if(!isPasswordValid) return done(null, false, {message: "Incorrect password"});

            return done(null, user);

        } catch (error) {
            return done(error);
        }
    })
);

export default configPassport;