import { expect } from "chai";
import hre from "hardhat";

describe("LhiLecceNFT", function () {
  let lhiLecceNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    const LhiLecceNFT = await hre.ethers.getContractFactory("LhiLecceNFT");
    lhiLecceNFT = await LhiLecceNFT.deploy("");
    await lhiLecceNFT.waitForDeployment();
  });

  it("Should mint NFTs correctly", async function () {
    const tokenId = 1;
    const quantity = 2;
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    const totalPrice = price * BigInt(quantity);

    await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: totalPrice });

    expect(await lhiLecceNFT.totalMinted(tokenId)).to.equal(quantity);
    expect(await lhiLecceNFT.balanceOf(addr1.address, tokenId)).to.equal(quantity);
  });

  it("Should revert if insufficient funds are sent", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await lhiLecceNFT.pricesInWei(tokenId);
    const insufficientFunds = price / BigInt(2);

    await expect(
      lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: insufficientFunds })
    ).to.be.revertedWith("Incorrect ETH amount");
  });

    it("Should revert if exceeds max supply", async function () {
        const tokenId = 1;
        const quantity = 60000;
        const price = await lhiLecceNFT.pricesInWei(tokenId);
        const totalPrice = price * BigInt(quantity);

        await expect(lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, {value: totalPrice})).to.be.revertedWith("Exceeds max supply");
    });

    it("Should allow the owner to withdraw funds", async function() {
      const tokenId = 1;
      const quantity = 1;
      const price = await lhiLecceNFT.pricesInWei(tokenId);

      // Mint a token
      await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: price });

      // Get initial balances
      const initialOwnerBalance = await hre.ethers.provider.getBalance(owner.address);

      // Withdraw funds
      const tx = await lhiLecceNFT.connect(owner).withdrawFunds();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;


      // Get final balances
      const finalOwnerBalance = await hre.ethers.provider.getBalance(owner.address);
      const contractBalance = await hre.ethers.provider.getBalance(lhiLecceNFT.target);

      // Check balances
      expect(finalOwnerBalance).to.be.closeTo(initialOwnerBalance + BigInt(price) - BigInt(gasUsed), ethers.parseEther("0.0001")); // Tolleranza per il gas
      expect(contractBalance).to.equal(0);

    });

    it("Should revert if a non-owner tries to withdraw", async function() {
        // Aggiungi fondi al contratto PRIMA di provare a prelevare come non-proprietario
        const tokenId = 1;
        const quantity = 1;
        const price = await lhiLecceNFT.pricesInWei(tokenId);
        await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, { value: price }); //addr1 conia, e quindi invia ETH

        await expect(lhiLecceNFT.connect(addr1).withdrawFunds()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should burn tokens correctly", async function () {
      const tokenId = 1;
      const quantityToMint = 5;
      const quantityToBurn = 2;
      const price = await lhiLecceNFT.pricesInWei(tokenId);
      const totalPrice = price * BigInt(quantityToMint);


      // Mint tokens
      await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantityToMint, { value: totalPrice });

      // Burn tokens
      await lhiLecceNFT.connect(addr1).burn(tokenId, quantityToBurn);

      // Check balance after burning.  Verifica il *balanceOf*, non totalMinted
      expect(await lhiLecceNFT.balanceOf(addr1.address, tokenId)).to.equal(quantityToMint - quantityToBurn);
      expect(await lhiLecceNFT.totalMinted(tokenId)).to.equal(quantityToMint); // totalMinted non cambia
  });

    it("Should revert if user burns more tokens then they own", async function(){
        const tokenId = 1;
        const quantityToMint = 1;
        const quantityToBurn = 3;
        const price = await lhiLecceNFT.pricesInWei(tokenId);

        await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantityToMint, { value: price });
        await expect(lhiLecceNFT.connect(addr1).burn(tokenId, quantityToBurn)).to.be.revertedWith("Insufficient balance");

    });

    it("Should set the base URI correctly", async function () {
        const newBaseURI = "ipfs://newBaseURI/";
        await lhiLecceNFT.connect(owner).setBaseURI(newBaseURI);
        expect(await lhiLecceNFT.uri(1)).to.equal(newBaseURI + "preview.jpg");

    });
});