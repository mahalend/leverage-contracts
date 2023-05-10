require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const { ALCHEMY_KEY, PRIVATE_KEY, API_KEY } = process.env;


const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      forking: {
        url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      },
      accounts: [
        {
          balance: "100000000000000000000",
          privateKey: PRIVATE_KEY || "",
        },
      ],
    },
    arbitrumOne: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [PRIVATE_KEY || ""],
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: API_KEY || "",
    },
  },
};

export default config;
