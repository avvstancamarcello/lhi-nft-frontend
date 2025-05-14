const hre = require("hardhat");
const { expect } = require("chai");

describe("LHILecceNFT", function () {
  let contract;
  let owner;
  let addr1;
  let addr2;
  let weth;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    // Usa variabile di ambiente per decidere se usare WETH reale o mock
    const ethers = hre.ethers;
    const realWethAddress = process.env.USE_REAL_WETH;
    let wethAddress;
    if (realWethAddress && ethers.utils.isAddress(realWethAddress)) {
      weth = await ethers.getContractAt("ERC20Mock", realWethAddress);
      wethAddress = realWethAddress;
    } else {
      const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
      weth = await ERC20Mock.deploy(
        "Wrapped Ether",
        "WETH",
        owner.address,
        ethers.parseEther("1000000")
      );
      await weth.waitForDeployment();
      wethAddress = await weth.getAddress();
    }
    console.log("WETH address used in test:", wethAddress);

    // Deploy NFT contract con indirizzo WETH
    const LHILecceNFT = await ethers.getContractFactory("LHILecceNFT");
    const baseURI = "ipfs://";
    contract = await LHILecceNFT.deploy(baseURI, await owner.getAddress(), wethAddress);
    await contract.waitForDeployment();
  });

  it("Should mint NFTs correctly with native", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await contract.pricesInWei(tokenId);

    await contract.connect(addr1).mintNFT(tokenId, quantity, false, { value: price });

    const balance = await contract.balanceOf(await addr1.getAddress(), tokenId);
    expect(balance).to.equal(quantity);
  }); 

  it("Should mint NFTs correctly with ERC20 (WETH)", async function () {
    await weth.mint(await addr1.getAddress(), hre.ethers.parseEther("100"));
    const tokenId = 2;
    const quantity = 1;
    const price = await contract.pricesInWei(tokenId);
    const totalPrice = price * BigInt(quantity);
    await weth.transfer(await addr1.getAddress(), hre.ethers.parseEther("10"));
    await weth.connect(addr1).approve(await contract.getAddress(), price);
    await contract.connect(addr1).mintNFT(tokenId, quantity, true);
    const balance = await contract.balanceOf(await addr1.getAddress(), tokenId);
    expect(balance).to.equal(quantity);
  });

  it("Should revert if insufficient ERC20 allowance", async function () {
    await weth.mint(await addr1.getAddress(), hre.ethers.parseEther("100"));
    const tokenId = 2;
    const quantity = 1;
    await weth.transfer(await addr1.getAddress(), hre.ethers.parseEther("1"));
    // No approve
    await expect(
      contract.connect(addr1).mintNFT(tokenId, quantity, true)
    ).to.be.reverted;
  });

  it("Should revert if exceeds max supply", async function () {
    const tokenId = 1;
    const quantity = 60000;
    const price = await contract.pricesInWei(tokenId);
    const totalPrice = price * BigInt(quantity);

    await expect(
      contract.connect(addr1).mintNFT(tokenId, quantity, false, { value: totalPrice })
    ).to.be.revertedWith("Exceeds max supply");
  });

  it("Should allow the owner to withdraw native funds", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await contract.pricesInWei(tokenId);

    await contract.connect(addr1).mintNFT(tokenId, quantity, false, { value: price });

    const initialContractBalance = await hre.ethers.provider.getBalance(await contract.getAddress());
    await contract.connect(owner).withdrawFunds();

    const finalContractBalance = await hre.ethers.provider.getBalance(await contract.getAddress());
    expect(finalContractBalance).to.equal(0);
    expect(initialContractBalance).to.equal(price);
  });

  it("Should allow the owner to withdraw ERC20 tokens", async function () {
    await weth.mint(await addr1.getAddress(), hre.ethers.parseEther("100"));
    const tokenId = 2;
    const quantity = 2;
    const price = await contract.pricesInWei(tokenId);
    const totalPrice = price * BigInt(quantity);

    await weth.transfer(await addr1.getAddress(), hre.ethers.parseEther("10"));
    await weth.connect(addr1).approve(await contract.getAddress(), hre.ethers.parseEther("10"));
    await contract.connect(addr1).mintNFT(tokenId, quantity, true);

    const contractBalance = await weth.balanceOf(await contract.getAddress());
    expect(contractBalance).to.equal(totalPrice);

    await contract.connect(owner).withdrawTokens();
    expect(await weth.balanceOf(await contract.getAddress())).to.equal(0);
  });

  it("Should revert if a non-owner tries to withdraw native funds", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await contract.pricesInWei(tokenId);

    await contract.connect(addr1).mintNFT(tokenId, quantity, false, { value: price });

    await expect(contract.connect(addr1).withdrawFunds()).to.be.reverted;
  });

  it("Should revert if a non-owner tries to withdraw ERC20 tokens", async function () {
    await weth.mint(await addr1.getAddress(), hre.ethers.parseEther("100"));
    const tokenId = 2;
    const quantity = 1;
    const price = await contract.pricesInWei(tokenId);

    await weth.transfer(await addr1.getAddress(), hre.ethers.parseEther("10"));
    await weth.connect(addr1).approve(await contract.getAddress(), hre.ethers.parseEther("10"));
    await contract.connect(addr1).mintNFT(tokenId, quantity, true);

    await expect(contract.connect(addr1).withdrawTokens()).to.be.reverted;
  });

  it("Should revert if user burns more tokens than they own", async function(){
    const tokenId = 1;
    const quantityToMint = 1;
    const quantityToBurn = 3;
    const price = await contract.pricesInWei(tokenId);

    await contract.connect(addr1).mintNFT(tokenId, quantityToMint, false, { value: price });

    await expect(contract.connect(addr1).requestBurn(tokenId, quantityToBurn))
      .to.be.revertedWith("Insufficient balance");
  });

  it("Should emit NFTMinted event", async function () {
    const tokenId = 1;
    const quantity = 1;
    const price = await contract.pricesInWei(tokenId);
    const encryptedURI = await contract.getEncryptedURI(tokenId);

    await expect(contract.connect(addr1).mintNFT(tokenId, quantity, false, { value: price }))
      .to.emit(contract, "NFTMinted")
      .withArgs(await addr1.getAddress(), tokenId, quantity, price, encryptedURI);
  });

  it("Should set the base URI correctly", async function () {
    const tokenId = 1;
    const tokenCID = "preview.jpg";

    await contract.connect(owner).setTokenCID(tokenId, tokenCID);

    const expectedURI = `ipfs://${tokenCID}`;
    const actualURI = await contract.uri(tokenId);

    expect(actualURI).to.equal(expectedURI);
  });

  it("Should verify burn protection for minimum total value", async function () {
    for (let i = 1; i <= 24; i++) {
      const tokenId = i;
      const quantity = 10;
      const price = await contract.pricesInWei(tokenId);
      const totalPrice = price * BigInt(quantity);
      await contract.connect(addr1).mintNFT(tokenId, quantity, false, { value: totalPrice });
    }

    const tokenId = 1;
    const quantityToBurn = 2;

    await contract.connect(addr1).requestBurn(tokenId, quantityToBurn);
    const burnRequestId = 0;

    const balanceBefore = await contract.balanceOf(await addr1.getAddress(), tokenId);

    await expect(
      contract.connect(owner).approveBurn(burnRequestId, true)
    ).to.be.revertedWith("Cannot burn below minimum total value");

    const balanceAfter = await contract.balanceOf(await addr1.getAddress(), tokenId);
    expect(balanceAfter).to.equal(balanceBefore);
  });
});