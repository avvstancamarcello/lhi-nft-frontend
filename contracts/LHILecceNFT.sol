// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LHILecceNFT is ERC1155URIStorage, Ownable {
    string public name = "LHI Lecce NFT";
    string public symbol = "LHILE";

    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalMinted;
    mapping(uint256 => uint256) public pricesInWei; // Prezzi DIRETTAMENTE in wei
    mapping(uint256 => bool) public isValidTokenId; // Per controllare i tokenId validi

    address public withdrawWallet;

    event NFTMinted(address indexed buyer, uint256 tokenId, uint256 quantity, uint256 price);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event BaseURIUpdated(string newBaseURI); // Se vuoi cambiare la base URI
    event NFTBurned(address indexed owner, uint256 tokenId, uint256 quantity);
    // Usa gli eventi standard di ERC1155 per transfer e approval

    constructor(string memory baseURI) ERC1155(baseURI) Ownable(msg.sender) {
        withdrawWallet = 0x89a93452c77543a4D9035fE135F8Eb70C5D1FF2B;

        // Definisci prezzi, maxSupply e tokenId validi in un unico ciclo
        pricesInWei[1] = 0.00005000 ether;
        pricesInWei[2] = 0.00008884 ether;
        pricesInWei[3] = 0.00012768 ether;
        pricesInWei[4] = 0.00016652 ether;
        pricesInWei[5] = 0.00020536 ether;
        pricesInWei[6] = 0.00024420 ether;
        pricesInWei[7] = 0.00028304 ether;
        pricesInWei[8] = 0.00032188 ether;
        pricesInWei[9] = 0.00036072 ether;
        pricesInWei[10] = 0.00039956 ether;
        pricesInWei[11] = 0.00043840 ether;
        pricesInWei[12] = 0.00047724 ether;
        pricesInWei[13] = 0.00051608 ether;
        pricesInWei[14] = 0.00055492 ether;
        pricesInWei[15] = 0.00059376 ether;
        pricesInWei[16] = 0.00063260 ether;
        pricesInWei[17] = 0.00067144 ether;
        pricesInWei[18] = 0.00071028 ether;
        pricesInWei[19] = 0.00074912 ether;
        pricesInWei[20] = 0.00078796 ether;
        pricesInWei[21] = 0.00082680 ether;
        pricesInWei[22] = 0.00086564 ether;
        pricesInWei[23] = 0.00090448 ether;
        pricesInWei[24] = 0.00094332 ether;

        for (uint256 i = 1; i <= 24; i++) {
            maxSupply[i] = 50000;
            isValidTokenId[i] = true;
        }
    }

    function mintNFT(uint256 tokenId, uint256 quantity) external payable {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        require(totalMinted[tokenId] + quantity <= maxSupply[tokenId], "Exceeds max supply"); // Usa l'operatore +
        require(quantity > 0, "Invalid quantity");

        uint256 totalCostInWei = pricesInWei[tokenId] * quantity; // Usa l'operatore *
        require(msg.value == totalCostInWei, "Incorrect ETH amount");

        totalMinted[tokenId] = totalMinted[tokenId] + quantity; // Usa l'operatore +
        _mint(msg.sender, tokenId, quantity, ""); // Usa _mint di OpenZeppelin
        emit NFTMinted(msg.sender, tokenId, quantity, pricesInWei[tokenId]);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(isValidTokenId[tokenId], "Invalid tokenId");
        return string(abi.encodePacked(super.uri(tokenId), "preview.jpg")); // Usa il baseURI
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw"); // CORRETTO

        payable(withdrawWallet).transfer(balance);
        emit FundsWithdrawn(withdrawWallet, balance);
    }
  
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _setURI(newBaseURI);
        emit BaseURIUpdated(newBaseURI);
    }

    function burn(uint256 tokenId, uint256 quantity) external {
        require(balanceOf(msg.sender, tokenId) >= quantity, "Insufficient balance");
        _burn(msg.sender, tokenId, quantity);
        emit NFTBurned(msg.sender, tokenId, quantity);
    }

    // Usa le funzioni di ERC1155 di OpenZeppelin per transfer e approval:
    // safeTransferFrom, safeBatchTransferFrom, balanceOf, balanceOfBatch,
    // setApprovalForAll, isApprovedForAll
}