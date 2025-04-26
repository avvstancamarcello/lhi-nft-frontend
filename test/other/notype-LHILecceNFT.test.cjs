const { expect } = require("chai");
const hre = require("hardhat");

describe("LHILecceNFT", function () {
  let lhiLecceNFT;
  let owner;
  let addr1;
  let addr2;
  let weth;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    // Deploy mock WETH (ERC20)
    const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
    weth = await ERC20Mock.deploy(
      "Wrapped Ether",
      "WETH",
      owner.address,
      hre.ethers.utils.parseEther("1000000")
    );
    await weth.deployed();

    // Deploy NFT contract con indirizzo WETH
    const LHILecceNFT = await hre.ethers.getContractFactory("LHILecceNFT");
    const baseURI = "ipfs://";
    lhiLecceNFT = await LHILecceNFT.deploy(baseURI, owner.address, weth.address);
    await lhiLecceNFT.deployed();
  });

  it("Should mint NFTs correctly with ERC20 (WETH)", async function () {
      const tokenId = 2;
      const quantity = 1;
      const price = await lhiLecceNFT.pricesInWei(tokenId);
      
      await weth.transfer(addr1.address, hre.ethers.utils.parseEther("10"));
      await weth.connect(addr1).approve(lhiLecceNFT.address, price);
      await lhiLecceNFT.connect(addr1).mintNFT(tokenId, quantity, true);
  
      const balance = await lhiLecceNFT.balanceOf(addr1.address, tokenId);
      expect(balance).to.equal(quantity);
    });
});