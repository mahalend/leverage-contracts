import { ethers } from "ethers";
import abi from "./abi/mahalendDebt.json";
import { JsonRpcProvider } from "@ethersproject/providers";

const provider = new JsonRpcProvider(
  "https://arb-mainnet.g.alchemy.com/v2/TXo4-GDMK8_CR2xT6oHr83OhY3O2SuSw"
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "");

// connect the wallet to the provider
const signer = wallet.connect(provider);

export const variableContract = new ethers.Contract(
  "0x571BeFd7972A4fc8804D493fFEc2183370ad2696",
  abi,
  signer
);
