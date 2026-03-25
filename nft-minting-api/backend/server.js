require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

// ENV
const { PRIVATE_KEY, RPC_URL, CONTRACT_ADDRESS } = process.env;

// Provider + Wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ABI
const contractABI = require("./abi.json");

// Contract instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// 🔥 MINT API
app.post("/mint", async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "walletAddress is required",
      });
    }

    const mintPrice = await contract.mintPrice();

    const tx = await contract.mint(walletAddress, {
      value: mintPrice,
    });

    const receipt = await tx.wait();

    // tokenId = totalSupply
    const tokenId = await contract.totalSupply();

    res.json({
      success: true,
      txHash: receipt.hash,
      tokenId: tokenId.toString(),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});