import { ethers } from "hardhat";

async function main() {
  console.log("--------------------------------------------------");
  console.log("Deploying FinGuardTrustFlow Smart Contract...");
  console.log("--------------------------------------------------");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying from account: ${deployer.address}`);

  const FinGuardFactory = await ethers.getContractFactory("FinGuardTrustFlow");
  const contract = await FinGuardFactory.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("==================================================");
  console.log(`FinGuardTrustFlow successfully deployed to: ${address}`);
  console.log("Target Network: Polygon Amoy Testnet (Chain ID: 80002)");
  console.log(`Set this address in your .env: CONTRACT_ADDRESS=${address}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
