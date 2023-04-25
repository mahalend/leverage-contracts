require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      forking: {
        url: `${process.env.ARBITRUM_RPC}`,
      },
      accounts: [
        {
          balance: "100000000000000000000",
          privateKey: process.env.PRIVATE_KEY || "",
        },
      ],
    },
    goerli: {
      url: process.env.GOERLI_INFURA_RPC,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrumOne: {
      url: process.env.ARBITRUM_RPC,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARB_API_KEY || "",
    },
  },
};

export default config;
