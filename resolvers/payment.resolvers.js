import axios from "axios";
import Payment from "../models/payment.model.js";
import ParkingSlot from "../models/parkingSlots.model.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import getAcessToken from "../config/safaricom/mpesaToken.js";
import stkPush from "../config/safaricom/mpesaStkPush.js";
import securityCredential from "../config/safaricom/security_credential.js";

dotenv.config();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkMpesaStatus(checkoutRequestID) {
  try {
    const token = await getAcessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .substring(0, 14);
    const password = Buffer.from(
      `${process.env.MPESA_PAYBILL}${process.env.PASSKEY}${timestamp}`
    ).toString("base64");

    const payload = {
      Initiator: process.env.MPESA_INITIATOR,
      SecurityCredential: securityCredential,
      CommandID: "TransactionStatusQuery",
      TransactionID: checkoutRequestID,
      PartyA: process.env.MPESA_PAYBILL,
      IdentifierType: "1",
      ResultURL: process.env.MPESA_RESULT_URL,
      QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
      Remarks: "Payment status query",
      Occasion: "Payment"
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error checking transaction status:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

const paymentResolvers = {
  Query: {
    async getPaymentById(_, { id }) {
      return await Payment.findById(id)
    },
    async getUserPayments(_, { userId }) {
      return await Payment.find({ user: userId })
    },
    async getAllPayments() {
      return await Payment.find()
    },
    async getPaymentsByStatus(_, { status }) {
      return await Payment.find({ status })
    },
  },

  Mutation: {
    async createPayment(_, { input }, context) {
      console.log("Received input:", input);

      const user = await context.getUser();
      if (!user) throw new Error("User not authenticated");
      const parkingSlotsAvailable = await ParkingSlot.find({ isAvailable: true });
      if (parkingSlotsAvailable.length === 0) throw new Error("No parking slots availabe");
      const parkingSlot = parkingSlotsAvailable[0];


      const { days,validFrom, validTill } = input;
      const amount = days * 1;
      
      const phone = user.phone;
      console.log("User ID:", user._id);

      const transactionId = uuidv4();

      const stkResponse = await stkPush(phone, amount);
      console.log("STK Push Response:", stkResponse);

      if (!stkResponse || stkResponse.ResponseCode !== "0") {
        throw new Error("STK Push failed. Please try again.");
      }

      console.log("STK Push sent. Waiting for M-Pesa confirmation...");

      const maxRetries = 2;
      let retries = 0;
      let statusResponse = null;

      while (retries < maxRetries) {
        await sleep(6000);
        statusResponse = await checkMpesaStatus(stkResponse.CheckoutRequestID);
        console.log(`Status Check ${retries + 1}:`, statusResponse);

        if (statusResponse && statusResponse.ResponseCode === "0") {
          console.log(true)
          break;
        }
        retries++;
      }

      if (!statusResponse || statusResponse.ResponseCode !== "0") {
        throw new Error("Payment not confirmed.");
      }

      const  mpesaReceipt = statusResponse.MpesaReceiptNumber || "TEST_RECEIPT";
      console.log("Payment confirmed. Receipt:", mpesaReceipt);

      try {
        console.log('saving to db')
        const newPayment = new Payment({
          user: user._id,
          amount,
          transactionId,
          status: "Completed",
          receipt: mpesaReceipt,
        });
        await newPayment.save();
        const bookSlot = await ParkingSlot.findByIdAndUpdate(
          parkingSlot._id, { 
            isAvailable: false, 
            paymentId: newPayment._id, 
            bookedBy: user._id, 
            validFrom, 
            validTill 
          }, { new: true }
        );
        
        return newPayment;
        
      } catch (error) {
        console.error("Error saving payment to DB:", error);
        throw new Error("Payment confirmed but failed to save to the database.");
        
      }
    },

    async updatePaymentStatus(_, { input }) {
      const { paymentId, status } = input;

      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        { status },
        { new: true }
      ).populate("user");

      if (!updatedPayment) throw new Error("Payment not found");

      return updatedPayment;
    },

    async deletePayment(_, { id }) {
      const deletedPayment = await Payment.findByIdAndDelete(id).populate("user");
      if (!deletedPayment) throw new Error("Payment not found");

      return deletedPayment;
    },
  },
};

export default paymentResolvers;