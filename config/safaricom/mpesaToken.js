import axios from "axios";
import { config } from "dotenv";

config();

const getAcessToken = async()=>{
  const auth  = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString('base64');

  try {
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: {authorization: `Basic ${auth}`}
    });
    return response.data.access_token;
  } catch (error) {
    throw new Error("Failed to get M-Pesa access token"); 
  }

}

export default getAcessToken;