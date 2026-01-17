import { Chainrails, crapi } from "@chainrails/sdk";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CHAINRAILS_DOMAIN_WHITELIST }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`App started on port ${port}`);
});

app.get("/", (req, res) => res.send("Chainrails Session Server"));

app.get("/session", async (req, res) => {
  const api_key = process.env.CHAINRAILS_API_KEY;
  const amount = "9.89";
  const recipient = "0x...";
  const destinationChain = "BASE";
  const token = "USDC";

  Chainrails.config({
    api_key,
  });

  const session = await crapi.auth.getSessionToken({
    amount: amount,
    recipient: recipient,
    destinationChain: destinationChain,
    token: token,
  });

  res.send(session);
});

export default app;
