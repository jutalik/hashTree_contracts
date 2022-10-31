import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
        {
            version: '0.4.24',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
        {
            version: '0.4.26',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
        {
            version: '0.5.0',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
        {
            version: '0.5.2',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
        {
            version: '0.5.6',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
        {
            version: '0.5.9',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
        {
            version: '0.8.0',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
        {
            version: '0.8.12',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200,
                    details: {
                        yul: false,
                    },
                },
            },
        },
    ],
},
  networks: {
    klaytn: {
      url: process.env.KLAYTN_MAINNET || "",
      gasPrice: 250000000000,
      accounts:
        process.env.KLAY_DEV_PRIVATE_KEY !== undefined
          ? [process.env.KLAY_DEV_PRIVATE_KEY]
          : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
