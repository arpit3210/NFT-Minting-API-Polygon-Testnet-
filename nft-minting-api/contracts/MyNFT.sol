// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 5; // 
    uint256 public mintPrice = 1 ether; // Default 1 MATIC 
    uint256 public totalSupply;

    string private _baseTokenURI;

    constructor(string memory baseURI) ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    // [cite: 12] Public mint function
    function mint(address to) external payable nonReentrant {
        require(totalSupply < MAX_SUPPLY, "Max supply reached"); // [cite: 20]
        require(msg.value == mintPrice, "Incorrect MATIC amount"); // [cite: 21, 42]

        totalSupply++;
        _safeMint(to, totalSupply);
    }

    // [cite: 16] Update mint price
    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
    }

    //  Support for base URI
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    // [cite: 17] Withdraw contract balance
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    // Overriding tokenURI to append .json if your metadata host requires it
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"));
    }
}