import { network } from "hardhat";

async function main() {
  console.log("===============================================================");
  console.log("             Deploying BlockPoll Smart Contract                ");
  console.log("===============================================================\n");

  const connection = await network.connect();
  const { ethers, networkName } = connection;
  const signers = await ethers.getSigners();
  const admin = signers[0];

  console.log(`Target Network: ${networkName}`);
  console.log(`Deployer / Admin Address: ${admin.address}`);

  const electionTitle = "College Student Council Election 2026";
  const blockPoll = await ethers.deployContract("BlockPoll", [electionTitle]);
  await blockPoll.waitForDeployment();

  const deployedAddress = blockPoll.target;

  console.log("\n---------------------------------------------------------------");
  console.log(`✔ BlockPoll successfully deployed!`);
  console.log(`  Actual Contract Address: ${deployedAddress}`);
  console.log(`  Election Title: "${electionTitle}"`);
  console.log("---------------------------------------------------------------\n");

  // Pre-seed initial candidates (IDs start at 1)
  console.log("Registering sample candidates...");
  const candidateNames = ["Alice Johnson (CS Dept)", "Bob Smith (EC Dept)", "Charlie Davis (ME Dept)"];
  for (const name of candidateNames) {
    const tx = await blockPoll.registerCandidate(name);
    await tx.wait();
  }
  console.log(`✔ Registered ${candidateNames.length} sample candidates (IDs 1 to ${candidateNames.length}).`);

  // Pre-register sample local voters (from signers 1, 2, 3)
  console.log("\nRegistering sample local test voter accounts...");
  const testVoterSigners = signers.slice(1, 4);
  for (let i = 0; i < testVoterSigners.length; i++) {
    const voter = testVoterSigners[i];
    const tx = await blockPoll.registerVoter(voter.address);
    await tx.wait();
    console.log(`  - Voter ${i + 1}: ${voter.address}`);
  }
  console.log("✔ Sample voters registered successfully.");

  console.log("\n===============================================================");
  console.log("                 NEXT STEPS FOR FUTURE UI                      ");
  console.log("===============================================================");
  console.log(`1. Copy the actual contract address printed above:`);
  console.log(`   ${deployedAddress}`);
  console.log(`2. Refer to blockchain/docs/FRONTEND_INTEGRATION.md for ABI location`);
  console.log(`   and Web3 connection guidelines.`);
  console.log("===============================================================\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
