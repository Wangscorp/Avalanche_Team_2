const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FarmersMarket contract...");

  const FarmersMarket = await ethers.getContractFactory("FarmersMarket");
  const farmersMarket = await FarmersMarket.deploy();

  await farmersMarket.waitForDeployment();
  
  const address = await farmersMarket.getAddress();
  console.log("FarmersMarket deployed to:", address);

  // Save the contract address
  const fs = require("fs");
  const content = JSON.stringify({ address: address }, null, 2);
  fs.writeFileSync("contract-address.json", content);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
