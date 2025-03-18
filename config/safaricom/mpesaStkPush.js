import axios from "axios";
import dotenv from "dotenv";
import getAccessToken from "./mpesaToken.js";

dotenv.config();

const stkPush =async (phone, amount)=> {
  const token = await getAccessToken();

  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").substring(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_PAYBILL}${process.env.PASSKEY}${timestamp}`
  ).toString("base64");

  const formattedPhone = `254${phone}`;

  const payload = {
    BusinessShortCode: process.env.MPESA_PAYBILL,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_PAYBILL,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: "Parking Payment",
    TransactionDesc: "Parking fee",
  };

  try {

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      }
    );
    return response.data;

  } catch (error) {
    console.error("Error in STK Push:", error.response.data);
    throw new Error("Failed to send STK Push request");
  }
}

export default stkPush;
