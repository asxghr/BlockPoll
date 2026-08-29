import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const helloBlockchain = await ethers.deployContract("HelloBlockchain");

  await helloBlockchain.waitForDeployment();

  const initialMessage = await helloBlockchain.message();
  if (initialMessage !== "Hello Blockchain!") {
    throw new Error(`Expected the default message, received: ${initialMessage}`);
  }

  const updatedMessage = "Hello from the local test!";
  await (await helloBlockchain.setMessage(updatedMessage)).wait();

  if ((await helloBlockchain.message()) !== updatedMessage) {
    throw new Error("The message was not updated on the local blockchain.");
  }

  console.log("Contract test passed: message was read and updated successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
