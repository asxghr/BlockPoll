import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const helloBlockchain = await ethers.deployContract("HelloBlockchain");

  await helloBlockchain.waitForDeployment();

  console.log(`HelloBlockchain deployed to: ${helloBlockchain.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
