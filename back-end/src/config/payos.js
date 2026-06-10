import { PayOS } from "@payos/node";
import dotenv from "dotenv";

dotenv.config();

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || "placeholder",
  apiKey: process.env.PAYOS_API_KEY || "placeholder",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "placeholder",
});

export default payos;
