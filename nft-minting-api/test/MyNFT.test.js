const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT Contract", function () {
  let MyNFT, myNFT, owner, addr1, addr2;

  const BASE_URI = "https://api.example.com/metadata/";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy(BASE_URI);
    await myNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct owner", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

   it("Should revert for non-existent token URI", async function () {
  await expect(myNFT.tokenURI(1)).to.be.revertedWithCustomError(
    myNFT,
    "ERC721NonexistentToken"
  );
});
  });

  describe("Minting", function () {
    it("Should mint NFT successfully", async function () {
      const mintPrice = await myNFT.mintPrice();

      await myNFT.connect(addr1).mint(addr1.address, {
        value: mintPrice,
      });

      expect(await myNFT.totalSupply()).to.equal(1);
      expect(await myNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should fail if incorrect payment", async function () {
      await expect(
        myNFT.connect(addr1).mint(addr1.address, {
          value: ethers.parseEther("0.5"),
        })
      ).to.be.revertedWith("Incorrect MATIC amount");
    });

    it("Should not exceed max supply", async function () {
      const mintPrice = await myNFT.mintPrice();

      for (let i = 0; i < 5; i++) {
        await myNFT.connect(addr1).mint(addr1.address, {
          value: mintPrice,
        });
      }

      await expect(
        myNFT.connect(addr1).mint(addr1.address, {
          value: mintPrice,
        })
      ).to.be.revertedWith("Max supply reached");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update mint price", async function () {
      await myNFT.setMintPrice(ethers.parseEther("2"));
      expect(await myNFT.mintPrice()).to.equal(
        ethers.parseEther("2")
      );
    });

    it("Should not allow non-owner to update mint price", async function () {
      await expect(
        myNFT.connect(addr1).setMintPrice(ethers.parseEther("2"))
      ).to.be.reverted;
    });
  });

  describe("Withdraw", function () {
    it("Should allow owner to withdraw funds", async function () {
      const mintPrice = await myNFT.mintPrice();

      await myNFT.connect(addr1).mint(addr1.address, {
        value: mintPrice,
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      const tx = await myNFT.withdraw();
      const receipt = await tx.wait();

      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});