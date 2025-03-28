import { expect } from "chai";
import hre from "hardhat";

describe("LhiLecceNFT", function () { // NOME CORRETTO
  let lhiLecceNFT;  // Usa camelCase per la variabile (minuscola iniziale)
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    console.log("INIZIO beforeEach"); // LOG 1: Inizio beforeEach
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    console.log("  - Owner:", owner.address); // LOG 2: Indirizzo owner
    console.log("  - Addr1:", addr1.address); // LOG 3: Indirizzo addr1

    const LhiLecceNFT = await hre.ethers.getContractFactory("LhiLecceNFT"); // NOME CORRETTO
    lhiLecceNFT = await LhiLecceNFT.deploy(""); // Usa la variabile con la 'l' minuscola
    await lhiLecceNFT.waitForDeployment();
    console.log("  - Contratto deployato a:", lhiLecceNFT.target); // LOG 4: Indirizzo contratto
  });

  it("Should mint NFTs correctly", async function () {
    const tokenId = 1;
    const quantity = 2;
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    const totalPrice = price * BigInt(quantity);

    console.log("Minting NFTs...");
    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: totalPrice });
    console.log("NFTs minted");

    expect(await lhiLecceNFT.totalMinted(tokenId)).to.equal(quantity);
    expect(await lhiLecceNFT.balanceOf(addr1.address, tokenId)).to.equal(quantity);
  });

  it("Should revert if insufficient funds are sent", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    const insufficientFunds = price / BigInt(2);

    console.log("Testing insufficient funds...");
    await expect(
      lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: insufficientFunds })
    ).to.be.revertedWith("Incorrect ETH amount");
    console.log("Insufficient funds test passed");
  });

  it("Should revert if exceeds max supply", async function () {
    const tokenId = 1;
    const quantity = 60000;
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    const totalPrice = price * BigInt(quantity);

    console.log("Testing max supply...");
    await expect(lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: totalPrice }))
      .to.be.revertedWith("Exceeds max supply");
    console.log("Max supply test passed");
  });

  it("Should allow the owner to withdraw funds", async function() {
    const tokenId = 1;
    const quantity = 1;
    const price = await lhiLecceNFT.pricesInWei(tokenId);

    console.log("Minting NFT for withdraw test...");
    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: price });
    console.log("NFT minted for withdraw test");

    const initialOwnerBalance = await hre.ethers.provider.getBalance(owner.address);

    console.log("Withdrawing funds...");
    const tx = await lhiLecceNFT.connect(owner).withdrawFunds();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const finalOwnerBalance = await hre.ethers.provider.getBalance(owner.address);
    const contractBalance = await hre.ethers.provider.getBalance(lhiLecceNFT.target);

    expect(finalOwnerBalance).to.be.closeTo(initialOwnerBalance + BigInt(price) - BigInt(gasUsed), 100000000000000);
    expect(contractBalance).to.equal(0);
    console.log("Withdraw test passed");
  });

  it("Should revert if a non-owner tries to withdraw", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await lhiLecceNFT.pricesInWei(tokenId);

    console.log("Minting NFT for non-owner withdraw test...");
    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: price });
    console.log("NFT minted for non-owner withdraw test");

    console.log("Testing non-owner withdraw...");
    await expect(lhiLecceNFT.connect(addr1).withdrawFunds()).to.be.reverted; // Rimuovi il messaggio di errore specifico
    console.log("Non-owner withdraw test passed");
  });

  it("Should burn tokens correctly", async function () {
    const tokenId = 1;
    const quantityToMint = 5;
    const quantityToBurn = 2;
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    const totalPrice = price * BigInt(quantityToMint);

    console.log("Minting tokens for burn test...");
    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantityToMint, { value: totalPrice });
    console.log("Tokens minted for burn test");

    console.log("Burning tokens...");
    await lhiLecceNFT.connect(addr1).burn(tokenId, quantityToBurn);
    console.log("Tokens burned");

    expect(await lhiLecceNFT.balanceOf(addr1.address, tokenId)).to.equal(quantityToMint - quantityToBurn);
    expect(await lhiLecceNFT.totalMinted(tokenId)).to.equal(quantityToMint);
  });

  it("Should revert if user burns more tokens than they own", async function(){
    const tokenId = 1;
    const quantityToMint = 1;
    const quantityToBurn = 3;
    const price = await lhiLecceNFT.pricesInWei(tokenId);

    console.log("Minting tokens for over-burn test...");
    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantityToMint, { value: price });
    console.log("Tokens minted for over-burn test");

    console.log("Testing over-burn...");
    await expect(lhiLecceNFT.connect(addr1).burn(tokenId, quantityToBurn)).to.be.revertedWith("Insufficient balance");
    console.log("Over-burn test passed");
  });

  it("Should emit NFTMinted event", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await lhiLecceNFT.pricesInWei(tokenId);

    console.log("Testing NFTMinted event...");
    await expect(lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: price }))
      .to.emit(lhiLecceNFT, "NFTMinted")
      .withArgs(addr1.address, tokenId, quantity, price);
    console.log("NFTMinted event test passed");
  });

  it("Should set the base URI correctly", async function () {
    const newBaseURI = "ipfs://newBaseURI/";

    console.log("Setting base URI...");
    await lhiLecceNFT.connect(owner).setBaseURI(newBaseURI);
    console.log("Base URI set");

    expect(await lhiLecceNFT.uri(1)).to.equal(newBaseURI + "preview.jpg");
  });
});