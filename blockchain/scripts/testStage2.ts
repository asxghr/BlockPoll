import { network } from "hardhat";

async function main() {
  console.log("=== Running Stage 2 Tests: Election Lifecycle ===");
  const { ethers } = await network.connect();
  const [admin, nonAdmin, voter1] = await ethers.getSigners();

  // 1. Deploy BlockPoll
  const blockPoll = await ethers.deployContract("BlockPoll", ["Lifecycle Test Election"]);
  await blockPoll.waitForDeployment();
  console.log(`Deployed BlockPoll for Stage 2 tests at: ${blockPoll.target}`);

  // 2. Starting with 0 candidates must fail
  let failedAsExpected = false;
  try {
    await (await blockPoll.startElection()).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Election was started with 0 candidates!");
  }
  console.log("✔ Starting election with 0 candidates rejected.");

  // 3. Register 1 candidate; starting with 1 candidate must also fail
  await (await blockPoll.registerCandidate("Candidate One")).wait();
  failedAsExpected = false;
  try {
    await (await blockPoll.startElection()).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Election was started with only 1 candidate!");
  }
  console.log("✔ Starting election with 1 candidate rejected (minimum 2 required).");

  // 4. Register candidate 2 and voter 1
  await (await blockPoll.registerCandidate("Candidate Two")).wait();
  await (await blockPoll.registerVoter(voter1.address)).wait();

  // 5. Non-admin cannot start election
  failedAsExpected = false;
  try {
    const nonAdminContract = blockPoll.connect(nonAdmin);
    await (await nonAdminContract.startElection()).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Non-admin was able to start the election!");
  }
  console.log("✔ Non-admin startElection rejected.");

  // 6. Admin starts election -> state transitions to Ongoing (1)
  const txStart = await blockPoll.startElection();
  await txStart.wait();
  let state = await blockPoll.state();
  if (Number(state) !== 1) {
    throw new Error(`Expected state 1 (Ongoing), got ${state}`);
  }
  console.log("✔ Admin started election successfully. State is now 1 (Ongoing).");

  // 7. Candidate registration blocked after election starts
  failedAsExpected = false;
  try {
    await (await blockPoll.registerCandidate("Late Candidate")).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Candidate registration succeeded after election started!");
  }
  console.log("✔ Candidate registration blocked during Ongoing state.");

  // 8. Voter registration blocked after election starts
  failedAsExpected = false;
  try {
    await (await blockPoll.registerVoter(nonAdmin.address)).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Voter registration succeeded after election started!");
  }
  console.log("✔ Voter registration blocked during Ongoing state.");

  // 9. Cannot start election again
  failedAsExpected = false;
  try {
    await (await blockPoll.startElection()).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Calling startElection() again succeeded!");
  }
  console.log("✔ Redundant startElection() call rejected.");

  // 10. Non-admin cannot end election
  failedAsExpected = false;
  try {
    const nonAdminContract = blockPoll.connect(nonAdmin);
    await (await nonAdminContract.endElection()).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Non-admin was able to end the election!");
  }
  console.log("✔ Non-admin endElection rejected.");

  // 11. Admin ends election -> state transitions to Ended (2)
  const txEnd = await blockPoll.endElection();
  await txEnd.wait();
  state = await blockPoll.state();
  if (Number(state) !== 2) {
    throw new Error(`Expected state 2 (Ended), got ${state}`);
  }
  console.log("✔ Admin ended election successfully. State is now 2 (Ended).");

  // 12. Cannot end election again
  failedAsExpected = false;
  try {
    await (await blockPoll.endElection()).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Calling endElection() again succeeded!");
  }
  console.log("✔ Redundant endElection() call rejected.");

  // 13. Registration still blocked when Ended
  failedAsExpected = false;
  try {
    await (await blockPoll.registerCandidate("Post-End Candidate")).wait();
  } catch {
    failedAsExpected = true;
  }
  if (!failedAsExpected) {
    throw new Error("Candidate registration succeeded after election ended!");
  }
  console.log("✔ Candidate registration blocked during Ended state.");

  console.log("=== Stage 2 Test Suite PASSED Successfully! ===");
}

main().catch((error) => {
  console.error("Stage 2 Test Failed:", error);
  process.exitCode = 1;
});
