import { mergeTypeDefs } from "@graphql-tools/merge";
import userTypedef from "./user.typedef.js";
import parkingSlotTypedef from "./parkingSlots.typedef.js";
import paymentTypedef from "./payment.typedef.js";

const mergedTypeDefs = mergeTypeDefs([userTypedef, parkingSlotTypedef, paymentTypedef]);

export default mergedTypeDefs;
