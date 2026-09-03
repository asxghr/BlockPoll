import { network } from "hardhat";

async function main() {
  console.log("===============================================================");
  console.log("      Running BlockPoll Comprehensive Integration Tests        ");
  console.log("===============================================================\n");

  const { ethers } = await network.connect();
  const [admin, voter1, voter2, voter3, unregisteredUser, nonAdmin] = await ethers.getSigners();

  // 1. Deployment
  console.log("[1] Deploying BlockPoll contract...");
  const blockPoll = await ethers.deployContract("BlockPoll", ["Campus Election 2026"]);
  await blockPoll.waitForDeployment();
  console.log(`    BlockPoll deployed at: ${blockPoll.target}`);

  // Deployer check
  const contractAdmin = await blockPoll.admin();
  if (contractAdmin !== admin.address) {
    throw new Error(`Admin mismatch: expected ${admin.address}, got ${contractAdmin}`);
  }
  const initialState = await blockPoll.state();
  if (Number(initialState) !== 0) {
    throw new Error(`Initial state must be 0 (NotStarted), got ${initialState}`);
  }
  console.log("    ✔ Deployer is admin; initial state is 0 (NotStarted).\n");

  // 2. Candidate Registration
  console.log("[2] Testing Candidate Registration (IDs start at 1)...");
  await (await blockPoll.registerCandidate("Alice Johnson")).wait();
  let candidate1 = await blockPoll.candidates(1);
  if (Number(candidate1.id) !== 1 || candidate1.name !== "Alice Johnson" || Number(candidate1.voteCount) !== 0) {
    throw new Error("Candidate 1 ID must be 1 with voteCount 0");
  }

  await (await blockPoll.registerCandidate("Bob Smith")).wait();
  let candidate2 = await blockPoll.candidates(2);
  if (Number(candidate2.id) !== 2 || candidate2.name !== "Bob Smith") {
    throw new Error("Candidate 2 ID must be 2");
  }

  // Reject empty candidate name
  let failed = false;
  try {
    await (await blockPoll.registerCandidate("")).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Empty candidate name was accepted!");

  // Reject candidate registration by non-admin
  failed = false;
  try {
    await (await blockPoll.connect(nonAdmin).registerCandidate("Charlie")).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Non-admin was able to register candidate!");

  console.log("    ✔ Candidate IDs start at 1; empty name & non-admin registration rejected.\n");

  // 3. Voter Registration
  console.log("[3] Testing Voter Registration...");
  await (await blockPoll.registerVoter(voter1.address)).wait();
  await (await blockPoll.registerVoter(voter2.address)).wait();
  await (await blockPoll.registerVoter(voter3.address)).wait();

  // Reject duplicate voter
  failed = false;
  try {
    await (await blockPoll.registerVoter(voter1.address)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Duplicate voter registration allowed!");

  // Reject zero address
  failed = false;
  try {
    await (await blockPoll.registerVoter(ethers.ZeroAddress)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Zero address voter registration allowed!");

  // Reject voter registration by non-admin
  failed = false;
  try {
    await (await blockPoll.connect(nonAdmin).registerVoter(unregisteredUser.address)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Non-admin was able to register voter!");

  const voterCount = await blockPoll.getRegisteredVotersCount();
  if (Number(voterCount) !== 3) {
    throw new Error(`Expected registered voter count 3, got ${voterCount}`);
  }
  console.log("    ✔ Voters registered; duplicates, zero address, and non-admin registration rejected.\n");

  // 4. Voting Before Election Start
  console.log("[4] Testing Voting Prevention Before Start...");
  failed = false;
  try {
    await (await blockPoll.connect(voter1).vote(1)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Vote allowed before election started!");
  console.log("    ✔ Voting is prohibited before election starts.\n");

  // 5. Election Lifecycle: Start
  console.log("[5] Testing Election Start...");
  // Non-admin start attempt
  failed = false;
  try {
    await (await blockPoll.connect(nonAdmin).startElection()).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Non-admin was able to start election!");

  await (await blockPoll.startElection()).wait();
  let state = await blockPoll.state();
  if (Number(state) !== 1) {
    throw new Error(`State should be 1 (Ongoing), got ${state}`);
  }
  console.log("    ✔ Election started by admin; state is 1 (Ongoing).\n");

  // 6. Registration Locked During Election
  console.log("[6] Testing Registration Lock in Ongoing State...");
  failed = false;
  try {
    await (await blockPoll.registerCandidate("Late Candidate")).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Candidate registration permitted while election is ongoing!");

  failed = false;
  try {
    await (await blockPoll.registerVoter(unregisteredUser.address)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Voter registration permitted while election is ongoing!");
  console.log("    ✔ Both candidate and voter registrations are locked during election.\n");

  // 7. Voting Logic & Access Control
  console.log("[7] Testing Voting Rules (Eligibility, ID validity, Double-voting)...");
  // Unregistered voter voting attempt
  failed = false;
  try {
    await (await blockPoll.connect(unregisteredUser).vote(1)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Unregistered user was able to vote!");

  // Invalid candidate ID: 0
  failed = false;
  try {
    await (await blockPoll.connect(voter1).vote(0)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Vote for invalid candidate ID 0 was accepted!");

  // Invalid candidate ID: out of bounds
  failed = false;
  try {
    await (await blockPoll.connect(voter1).vote(99)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Vote for non-existent candidate ID 99 was accepted!");

  // Valid vote: Voter 1 votes for Candidate 1
  await (await blockPoll.connect(voter1).vote(1)).wait();
  const v1Status = await blockPoll.getVoterStatus(voter1.address);
  if (!v1Status[0] || !v1Status[1] || Number(v1Status[2]) !== 1) {
    throw new Error("Voter 1 status incorrect after voting");
  }

  // Attempt to vote again by Voter 1 (double-voting)
  failed = false;
  try {
    await (await blockPoll.connect(voter1).vote(2)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Double-voting was accepted!");

  // Voter 2 votes for Candidate 2
  await (await blockPoll.connect(voter2).vote(2)).wait();

  // Voter 3 votes for Candidate 1
  await (await blockPoll.connect(voter3).vote(1)).wait();

  console.log("    ✔ Valid votes cast; unregistered, out-of-bounds, and double-voting rejected.\n");

  // 8. Election Lifecycle: End
  console.log("[8] Testing Election End...");
  // Non-admin end attempt
  failed = false;
  try {
    await (await blockPoll.connect(nonAdmin).endElection()).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Non-admin was able to end election!");

  await (await blockPoll.endElection()).wait();
  state = await blockPoll.state();
  if (Number(state) !== 2) {
    throw new Error(`State should be 2 (Ended), got ${state}`);
  }
  console.log("    ✔ Election ended by admin; state is 2 (Ended).\n");

  // 9. Post-Election Voting Prohibited
  console.log("[9] Testing Post-Election Voting Rejection...");
  failed = false;
  try {
    // Attempt voting with any remaining voter or voter 1
    await (await blockPoll.connect(voter1).vote(1)).wait();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error("Vote accepted after election ended!");
  console.log("    ✔ Voting prohibited after election ends.\n");

  // 10. Verification of Transparent Results
  console.log("[10] Verifying Final Transparent Audit Results...");
  const candidates = await blockPoll.getAllCandidates();
  if (candidates.length !== 2) {
    throw new Error(`Expected 2 candidates, got ${candidates.length}`);
  }

  const [resCand1, resCand2] = candidates;
  console.log(`    Candidate ${resCand1.id} (${resCand1.name}): ${resCand1.voteCount} votes`);
  console.log(`    Candidate ${resCand2.id} (${resCand2.name}): ${resCand2.voteCount} votes`);

  if (Number(resCand1.voteCount) !== 2) {
    throw new Error(`Expected Candidate 1 to have 2 votes, got ${resCand1.voteCount}`);
  }
  if (Number(resCand2.voteCount) !== 1) {
    throw new Error(`Expected Candidate 2 to have 1 vote, got ${resCand2.voteCount}`);
  }
  console.log("    ✔ Transparent results tallied accurately.\n");

  console.log("===============================================================");
  console.log("    ALL TESTS PASSED! BlockPoll contract is fully verified.    ");
  console.log("===============================================================");
}

main().catch((error) => {
  console.error("\n❌ BlockPoll Integration Tests FAILED:", error);
  process.exitCode = 1;
});
