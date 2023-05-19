require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const { ALCHEMY_KEY, PRIVATE_KEY, API_KEY } = process.env;


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
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
    tenderly: {
      url: `https://rpc.tenderly.co/fork/3ceb1b0e-2923-4e94-ae8a-a40facf15033`,
      accounts: [PRIVATE_KEY || ""],
    }
  },
  etherscan: {
    apiKey: {
      arbitrumOne: API_KEY || "",
    },
  },
};

export default config;
