import { mergeResolvers } from "@graphql-tools/merge";
import userResolvers from "./user.resolvers.js";
import parkingSlotsResolvers from "./parkingSlots.resolvers.js";
import paymentResolvers from "./payment.resolvers.js";

const mergedResolvers = mergeResolvers([userResolvers, parkingSlotsResolvers, paymentResolvers]);

export default mergedResolvers; 