require("@nomicfoundation/hardhat-toolbox");

require("dotenv").config();

const { PRIVATE_KEY, RPC_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
