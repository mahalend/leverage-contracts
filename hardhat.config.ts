require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      // forking: {
      //   url: process.env.ARBITRUM_RPC || "",
      // },
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
    // arbitrumOne: {
    //   url: process.env.ARBITRUM_RPC,
    //   accounts: {
    //     mnemonic: process.env.MNEMONIC || "",
    //     path: "m/44'/60'/0'/0",
    //     initialIndex: 0,
    //     count: 20,
    //   },
    // },
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARB_API_KEY || "",
    },
  },
};

export default config;
