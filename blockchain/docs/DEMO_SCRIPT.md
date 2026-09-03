# BlockPoll: Professor Demonstration Script (3–5 Minutes)

This script provides a step-by-step walkthrough for demonstrating the **BlockPoll** blockchain voting system to evaluators and professors.

> **Demonstration Goal:** Prove that election rules (registration locks, double-voting prevention, and transparent tallying) are enforced autonomously by the smart contract on the blockchain without relying on any centralized database.
>
> **Notice:** All accounts shown are local development test accounts generated automatically by Hardhat. No real private keys or cryptocurrency funds are used.

---

## Pre-Demo Checklist
1. Open two terminal windows.
2. Navigate both terminals to the `blockchain/` directory:
   ```bash
   cd /Users/asxghr/BlockPoll/blockchain
   ```
3. Ensure packages are installed (`npm install`).

---

## Minute 1: Starting Local Blockchain & Deployment

### Step 1.1: Start Local Hardhat Blockchain
In **Terminal 1**, run:
```bash
npx hardhat node
```
**What to say to evaluator:**
> *"Here, we are booting our local Ethereum-compatible JSON-RPC blockchain node on port 8545. Hardhat initializes twenty pre-funded local accounts for our local development sandbox."*

**Expected Output:**
Terminal 1 displays 20 accounts (e.g., Account #0 as deployer/admin) and begins listening at `http://127.0.0.1:8545`.

---

### Step 1.2: Deploy BlockPoll & Seed Initial Data
In **Terminal 2**, run:
```bash
npm run deploy:localhost
```
**What to say to evaluator:**
> *"Now we deploy our BlockPoll smart contract to the running node. The deployment script sets Account #0 as the admin, pre-seeds three student candidates with IDs 1 to 3, and registers three student voter wallet addresses."*

**Expected Output:**
```text
Target Network: localhost
Deployer / Admin Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✔ BlockPoll successfully deployed!
  Actual Contract Address: 0x...
✔ Registered 3 sample candidates (IDs 1 to 3).
✔ Sample voters registered successfully.
```
*Note down or copy the displayed `Actual Contract Address`.*

---

## Minute 2: Verifying Node Persistence & Registration State

### Step 2.1: Verify State on Blockchain
In **Terminal 2**, run:
```bash
CONTRACT_ADDRESS=<paste_address_here> npm run verify:localhost
```
**What to say to evaluator:**
> *"To prove that the data persists on our blockchain node rather than just temporary memory, this standalone script queries the node directly over JSON-RPC. We can see the election state is 0 (NotStarted), three candidates are registered, and each candidate currently has 0 votes."*

**Expected Output:**
```text
Election Title: "College Student Council Election 2026"
Admin Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
State: 0 (0 = NotStarted, 1 = Ongoing, 2 = Ended)
Total Candidates: 3
Registered Voters Count: 3
Candidates List:
  [ID: 1] Alice Johnson (CS Dept) - Votes: 0
  [ID: 2] Bob Smith (EC Dept) - Votes: 0
  [ID: 3] Charlie Davis (ME Dept) - Votes: 0
✔ Persistence verification SUCCESS
```

---

## Minute 3: Comprehensive Rule Enforcement via Automated Tests

> [!NOTE]
> The automated test suite runs in an isolated test environment to verify the contract rules comprehensively. It is separate from the seeded contract deployed to the localhost node in the earlier demonstration steps.

In **Terminal 2**, run:
```bash
npm run test
```

**What to explain as tests run:**
> *"To demonstrate full contract security in real-time, our test suite executes ten distinct validation scenarios against the contract rules:"*

1. **Rule 1 - Candidate IDs:** IDs strictly begin at 1; empty candidate names are rejected.
2. **Rule 2 - Authorization:** Only the deployer/admin can register candidates or voters; non-admin transactions are reverted by `onlyAdmin`.
3. **Rule 3 - Pre-Election Voting Guard:** Voters cannot vote while state is `0` (`NotStarted`).
4. **Rule 4 - Lifecycle Start:** Admin calls `startElection()`. State shifts to `1` (`Ongoing`). Requires at least 2 candidates.
5. **Rule 5 - Registration Lock:** Once ongoing, any attempt to register new candidates or voters reverts with `"Invalid action for current election state"`.

---

## Minute 4: Casting Votes & Double-Voting Prevention

Point to steps [7], [8], and [9] in the test output:

1. **Eligibility Check:**
   > *"When an unregistered wallet tries to vote, the transaction is rejected on-chain: `require(voters[msg.sender].isRegistered)`."*
2. **Valid Vote Casting:**
   > *"Voter 1 casts a vote for Candidate 1. Candidate 1's tally increments to 1, and Voter 1's record is updated (`hasVoted = true`)."*
3. **Double-Voting Prevention:**
   > *"Immediately after, Voter 1 attempts to vote a second time for Candidate 2. The contract reverts the transaction with: `You have already cast your vote`."*
4. **Election End:**
   > *"Admin calls `endElection()`. State shifts to `2` (`Ended`)."*
5. **Post-Election Guard:**
   > *"Any attempt to vote after `endElection()` is rejected because voting is only valid in the Ongoing state."*

---

## Minute 5: Transparent Final Audit & Conclusion

Point to Step [10] in the test output:
```text
[10] Verifying Final Transparent Audit Results...
    Candidate 1 (Alice Johnson): 2 votes
    Candidate 2 (Bob Smith): 1 votes
    ✔ Transparent results tallied accurately.
```

**Conclusion Summary to Professor:**
> *"In summary, BlockPoll demonstrates core blockchain principles:*
> *1. **Immutability:** Election rules cannot be altered by voters or administrators once deployed.*
> *2. **Transparency:** Anyone on the network can audit the candidate vote counts and voter turnout.*
> *3. **Decentralized Verification:** One-vote-per-voter enforcement happens in the smart contract itself, eliminating the need for a database or trusted central tally server.*
> *4. **Scope:** This is an educational local-chain prototype with public transparency rather than private ballot anonymity."*

---

## Quick Reference Commands

| Action | Terminal | Command |
| :--- | :---: | :--- |
| **Start Blockchain** | 1 | `npx hardhat node` |
| **Deploy & Seed** | 2 | `npm run deploy:localhost` |
| **Audit Persistence** | 2 | `CONTRACT_ADDRESS=<addr> npm run verify:localhost` |
| **Full Security Tests** | 2 | `npm run test` |
