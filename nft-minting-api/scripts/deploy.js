const { ethers } = require("hardhat");

async function main() {
  const BASE_URI = "https://api.example.com/metadata/";

  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy(BASE_URI);

  await myNFT.waitForDeployment();

  console.log("Contract deployed to:", await myNFT.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});