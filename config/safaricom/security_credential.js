import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

// Retrieve your initiator password from your .env file.
const initiatorPassword = process.env.INITIATOR_PASSWORD; 

// Get the absolute path to your PEM file.
// Assuming the file "mpesa_public_key.cer" is in the same directory as this script.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicKeyPath = path.join(__dirname, 'mpesa_public_key.cer');

// console.log("Public key path:", publicKeyPath);

// Read the PEM file as UTF-8 text.
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

// Create a public key object from the PEM string.
const publicKeyObject = crypto.createPublicKey(publicKey);

// Encrypt the initiator password using the public key with RSA PKCS#1 padding.
const encryptedBuffer = crypto.publicEncrypt(
  {
    key: publicKeyObject,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  },
  Buffer.from(initiatorPassword, "utf8")
);

// Convert the encrypted data to a base64-encoded string.
// This is your security credential.
const securityCredential = encryptedBuffer.toString("base64");

// console.log("Security Credential:", securityCredential);

export default securityCredential;
