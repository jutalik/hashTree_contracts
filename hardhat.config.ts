import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");

const config: HardhatUserConfig = {
  solidity: "0.8.17",
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
