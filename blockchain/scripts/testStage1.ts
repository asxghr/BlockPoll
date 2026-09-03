import { network } from "hardhat";

async function main() {
  console.log("=== Running Stage 1 Tests: Registration and Read Functions ===");
  const { ethers } = await network.connect();
  const [admin, voter1, voter2, nonAdmin] = await ethers.getSigners();

  // 1. Deploy BlockPoll
  const blockPoll = await ethers.deployContract("BlockPoll", ["Student Council Election 2026"]);
  await blockPoll.waitForDeployment();
  console.log(`Deployed BlockPoll for Stage 1 tests at: ${blockPoll.target}`);

  // 2. Admin & Init state checks
  const contractAdmin = await blockPoll.admin();
  if (contractAdmin !== admin.address) {
    throw new Error(`Expected admin ${admin.address}, got ${contractAdmin}`);
  }

  const state = await blockPoll.state();
  if (Number(state) !== 0) {
    throw new Error(`Expected initial state 0 (NotStarted), got ${state}`);
  }

  const electionName = await blockPoll.electionName();
  if (electionName !== "Student Council Election 2026") {
    throw new Error(`Unexpected election name: ${electionName}`);
  }
  console.log("✔ Admin and initial state verified (state: 0 = NotStarted).");

  // 3. Register Candidate 1
  await (await blockPoll.registerCandidate("Alice Johnson")).wait();
  let candidateCount = await blockPoll.candidateCount();
  if (Number(candidateCount) !== 1) {
    throw new Error(`Expected candidateCount 1, got ${candidateCount}`);
  }

  const candidate1 = await blockPoll.candidates(1);
  if (Number(candidate1.id) !== 1 || candidate1.name !== "Alice Johnson" || Number(candidate1.voteCount) !== 0) {
    throw new Error(`Candidate 1 verification failed: ${JSON.stringify(candidate1)}`);
  }
  console.log("✔ Candidate 1 registered with ID 1.");

  // 4. Register Candidate 2
  await (await blockPoll.registerCandidate("Bob Smith")).wait();
  candidateCount = await blockPoll.candidateCount();
  if (Number(candidateCount) !== 2) {
    throw new Error(`Expected candidateCount 2, got ${candidateCount}`);
  }
  const candidate2 = await blockPoll.candidates(2);
  if (Number(candidate2.id) !== 2 || candidate2.name !== "Bob Smith") {
    throw new Error(`Candidate 2 verification failed: ${JSON.stringify(candidate2)}`);
  }
  console.log("✔ Candidate 2 registered with ID 2.");

  // 5. Reject empty candidate name
  let failedAsExpected = false;
  try {
    await (await blockPoll.registerCandidate("")).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Expected empty candidate name to be rejected, but it succeeded.");
  }
  console.log("✔ Empty candidate name rejected as expected.");

  // 6. Non-admin cannot register candidates
  failedAsExpected = false;
  try {
    const nonAdminContract = blockPoll.connect(nonAdmin);
    await (await nonAdminContract.registerCandidate("Eve")).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Non-admin was able to register a candidate!");
  }
  console.log("✔ Non-admin candidate registration rejected.");

  // 7. Register voter
  await (await blockPoll.registerVoter(voter1.address)).wait();
  const voter1Status = await blockPoll.getVoterStatus(voter1.address);
  if (!voter1Status[0] || voter1Status[1] || Number(voter1Status[2]) !== 0) {
    throw new Error(`Voter 1 status mismatch: isReg=${voter1Status[0]}, hasVoted=${voter1Status[1]}`);
  }
  console.log("✔ Voter 1 registered successfully.");

  // 8. Prevent duplicate voter registration
  failedAsExpected = false;
  try {
    await (await blockPoll.registerVoter(voter1.address)).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Duplicate voter registration succeeded unexpectedly!");
  }
  console.log("✔ Duplicate voter registration prevented.");

  // 9. Prevent zero address voter registration
  failedAsExpected = false;
  try {
    await (await blockPoll.registerVoter(ethers.ZeroAddress)).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Zero address voter registration succeeded unexpectedly!");
  }
  console.log("✔ Zero address voter registration rejected.");

  // 10. Non-admin cannot register voters
  failedAsExpected = false;
  try {
    const nonAdminContract = blockPoll.connect(nonAdmin);
    await (await nonAdminContract.registerVoter(voter2.address)).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Non-admin was able to register a voter!");
  }
  console.log("✔ Non-admin voter registration rejected.");

  // 11. Test getAllCandidates and getRegisteredVotersCount
  const allCandidates = await blockPoll.getAllCandidates();
  if (allCandidates.length !== 2 || allCandidates[0].name !== "Alice Johnson" || allCandidates[1].name !== "Bob Smith") {
    throw new Error("getAllCandidates returned incorrect results");
  }

  const voterCount = await blockPoll.getRegisteredVotersCount();
  if (Number(voterCount) !== 1) {
    throw new Error(`Expected registered voters count 1, got ${voterCount}`);
  }
  console.log("✔ Read functions (getAllCandidates, getRegisteredVotersCount) verified.");

  console.log("=== Stage 1 Test Suite PASSED Successfully! ===");
}

main().catch((error) => {
  console.error("Stage 1 Test Failed:", error);
  process.exitCode = 1;
});
