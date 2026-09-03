import { network } from "hardhat";

async function main() {
  const connection = await network.connect();
  const { ethers, networkName } = connection;

  const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
  if (!contractAddress || !ethers.isAddress(contractAddress)) {
    console.error("Usage: CONTRACT_ADDRESS=<address> hardhat run --network localhost scripts/verifyPersistence.ts");
    console.error("Please provide a valid deployed contract address via CONTRACT_ADDRESS environment variable or CLI argument.");
    process.exit(1);
  }

  console.log("===============================================================");
  console.log("             Verifying BlockPoll on Localhost Node             ");
  console.log("===============================================================\n");
  console.log(`Target Network: ${networkName}`);
  console.log(`Checking Contract at: ${contractAddress}\n`);

  const blockPoll = await ethers.getContractAt("BlockPoll", contractAddress);

  const electionName = await blockPoll.electionName();
  const state = await blockPoll.state();
  const candidateCount = await blockPoll.candidateCount();
  const voterCount = await blockPoll.getRegisteredVotersCount();
  const admin = await blockPoll.admin();

  console.log(`Election Title: "${electionName}"`);
  console.log(`Admin Address: ${admin}`);
  console.log(`State: ${state} (0 = NotStarted, 1 = Ongoing, 2 = Ended)`);
  console.log(`Total Candidates: ${candidateCount}`);
  console.log(`Registered Voters Count: ${voterCount}\n`);

  console.log("Candidates List (Read directly from persistent blockchain):");
  const candidates = await blockPoll.getAllCandidates();
  for (const c of candidates) {
    console.log(`  [ID: ${c.id}] ${c.name} - Votes: ${c.voteCount}`);
  }

  if (electionName !== "College Student Council Election 2026") {
    throw new Error(`Unexpected election name: ${electionName}`);
  }

  if (Number(candidateCount) !== 3) {
    throw new Error(`Expected candidateCount to be 3, found ${candidateCount}`);
  }

  if (candidates.length !== 3) {
    throw new Error(`Expected 3 candidates from getAllCandidates, got ${candidates.length}`);
  }

  console.log("\n✔ Persistence verification SUCCESS: All state and seeded candidates confirmed on local node!");
  console.log("===============================================================\n");
}

main().catch((error) => {
  console.error("Persistence check failed:", error);
  process.exitCode = 1;
});
