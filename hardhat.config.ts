import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
require("dotenv").config()

const etherscanApiKey = process.env.ETHERSCAN_API_KEY
const privateKey = process.env.PRIVATE_METAMASK_KEY
const alchemyApiKey = process.env.ALCHEMY_API_KEY

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  etherscan: {
    apiKey: etherscanApiKey,
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`, // or use the Alchemy URL
      accounts: [`${privateKey}`], // Your wallet's private key
    },
  },
}

export default config
