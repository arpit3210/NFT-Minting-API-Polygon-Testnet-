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
    console.log("🚀 /mint API called");




    try {
        const { walletAddress } = req.body;
        console.log("📥 Request Body:", req.body);


        if (!walletAddress) {
            console.log("❌ walletAddress missing");
            return res.status(400).json({
                success: false,
                message: "walletAddress is required",
            });
        }


        if (!ethers.isAddress(walletAddress)) {
            console.log("❌ Invalid wallet address:", walletAddress);
            return res.status(400).json({
                success: false,
                message: "Invalid wallet address",
            });
        }

        console.log("✅ Valid wallet address:", walletAddress);


        console.log("⛽ Fetching mint price...");
        const mintPrice = await contract.mintPrice();
        console.log("💰 Mint Price:", mintPrice.toString());

        // 👉 Get backend wallet balance
        const balance = await provider.getBalance(wallet.address);
        console.log("🏦 Backend Wallet Balance:", balance.toString());

        // Check insufficient funds
        if (balance < mintPrice) {
            console.log("❌ ERROR: Backend wallet has insufficient funds");
            console.log("💰 Mint Price (ETH):", ethers.formatEther(mintPrice));
            console.log("🏦 Balance (ETH):", ethers.formatEther(balance));
            console.log("Required:", mintPrice.toString());
            console.log("Available:", balance.toString());

            return res.status(400).json({
                success: false,
                message: "Backend wallet has insufficient funds",
            });
        }

        console.log("📤 Sending mint transaction...");
        const tx = await contract.mint(walletAddress, {
            value: mintPrice,
        });




        console.log("⏳ Waiting for transaction confirmation...");
        const receipt = await tx.wait();

        console.log("✅ Transaction confirmed:", receipt.hash);


        const tokenId = await contract.totalSupply();
        console.log("🎉 Minted Token ID:", tokenId.toString());


        res.json({
            success: true,
            txHash: receipt.hash,
            tokenId: tokenId.toString(),
        });

    } catch (error) {
        console.error("🔥 ERROR OCCURRED:");
        console.error("Message:", error.message);

        if (error.reason) {
            console.error("Reason:", error.reason);
        }

        if (error.code) {
            console.error("Code:", error.code);
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);

    console.log("🔌 Connected to RPC:", RPC_URL);
    console.log("👛 Wallet Address:", wallet.address);
    console.log("📄 Contract Address:", CONTRACT_ADDRESS);
});