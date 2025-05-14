// scripts/deploy.cjs
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const baseURI = "ipfs://bafkreight2qjl53xhxxhhqagqccdk7ryj4455zx3ggazk7mqpbzxxiqlma";
  const owner = process.env.OWNER_WALLET;
  const paymentToken = process.env.PAYMENT_TOKEN; // WETH su Polygon

  console.log("Deploying contract...");
  console.log("Deployer:", deployer.address);
  console.log("baseURI:", baseURI);
  console.log("owner:", owner);
  console.log("paymentToken:", paymentToken);

  const ContractFactory = await ethers.getContractFactory("LHILecceNFT");
  const contract = await ContractFactory.deploy(baseURI, owner, paymentToken);

  console.log("Contract deployed at:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
