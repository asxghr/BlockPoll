# BlockPoll: Transparent Blockchain Voting System

> **Academic Project Notice:**
> BlockPoll is an educational mini-project prototype designed for demonstration on a local Ethereum-compatible development blockchain (Hardhat). It is **not** anonymous, **not** production-ready, and **not** suitable for high-stakes government or public elections. All votes, voter statuses, and candidate tallies are stored openly on-chain to illustrate blockchain data transparency, immutability, and smart contract rule enforcement.

---

## 1. Project Purpose & Scope

Traditional paper or centralized digital voting systems face challenges regarding vote tampering, unverified administrative tallying, and opacity in voter roll audits.

**BlockPoll** demonstrates how blockchain technology and self-executing smart contracts can enforce strict democratic rules at the code level:
- Only an administrator can register candidates and voters before voting begins.
- Once voting starts, registrations are permanently locked.
- Only pre-registered wallet addresses are authorized to cast a vote.
- Double-voting is mathematically impossible due to on-chain state verification.
- Results and vote counts are openly auditable in real-time by anyone connected to the network.

---

## 2. Technology Stack

- **Smart Contract Language:** Solidity (`^0.8.0`, compiled with `0.8.34`)
- **Development & Local Network:** Hardhat v3 (`^3.15.0`) running a local JSON-RPC Ethereum node (`http://127.0.0.1:8545`, Chain ID `31337`)
- **EVM Interaction Library:** ethers.js v6 (`^6.17.0`) via `@nomicfoundation/hardhat-ethers`
- **Language / Runtime:** TypeScript (`~6.0.3`) and Node.js
- **Future Frontend Interface:** React 19 + Vite (built with Google Stitch; communicates directly via ethers.js with zero intermediate database)

---

## 3. System Architecture

```text
+-------------------------------------------------------------------------+
|                  Future UI (React 19 + Vite / Google Stitch)            |
|          Connects via Browser Wallet (e.g., MetaMask) or Local RPC      |
+-------------------------------------------------------------------------+
                                    |
                                    v (JSON-RPC Calls / ethers.js v6)
+-------------------------------------------------------------------------+
|                    BlockPoll Smart Contract (Solidity)                  |
|  - Lifecycle States: NotStarted (0) -> Ongoing (1) -> Ended (2)         |
|  - Role-Based Access: Deployer is Admin (register & lifecycle controls) |
|  - One-Vote Guard: voters[msg.sender].hasVoted tracking                 |
|  - Transparent Tallies: Public candidate mappings & event logs          |
+-------------------------------------------------------------------------+
                                    |
                                    v (State Persistence)
+-------------------------------------------------------------------------+
|                       Hardhat Local Blockchain Node                     |
|           RPC: http://127.0.0.1:8545 | Chain ID: 31337 | EVM: Osaka     |
+-------------------------------------------------------------------------+
```

---

## 4. Contract Features & Rules

1. **Deployer as Admin:** The address that deploys the contract is permanently designated as `admin`.
2. **Candidate Indexing:** Candidate IDs strictly start at `1` (Candidate ID `0` is reserved as an unassigned/invalid sentinel). Empty candidate names are rejected.
3. **Registration Phase Lock:** Candidates and voters can only be registered when the election is in the `NotStarted` (`0`) state.
4. **Election Lifecycle:**
   - `startElection()`: Can only be triggered by the admin when in `NotStarted` state and requires at least two registered candidates. State transitions to `Ongoing` (`1`).
   - `endElection()`: Can only be triggered by the admin when in `Ongoing` state. State transitions to `Ended` (`2`).
5. **One-Time Voting:**
   - Voting is permitted only during the `Ongoing` (`1`) state.
   - Only registered addresses can vote.
   - Each registered address can vote exactly once (`hasVoted` flag).
   - Voting increments the chosen candidate's tally and records the choice on-chain.
6. **No Post-Election Tampering:** Once ended, no further votes can be cast, no candidates or voters can be added, and final tallies remain immutable.

---

## 5. System Limitations & Educational Caveats

- **No Ballot Secrecy (Not Anonymous):** The contract maps `voters[address].votedCandidateId` and emits `VoteCasted(address voter, uint256 candidateId)`. Anyone inspecting the blockchain can verify who voted for whom.
- **Centralized Admin Control:** The contract deployer has sole authority over candidate and voter registration.
- **Single-Election Scope:** The contract manages one election lifecycle (`NotStarted` $\to$ `Ongoing` $\to$ `Ended`).
- **Local Dev Sandbox:** Uses local Hardhat test private keys. These must **never** be used on public networks or with real monetary value.

---

## 6. Setup, Build & Execution Commands

All commands are executed inside the `blockchain/` directory:
```bash
cd /Users/asxghr/BlockPoll/blockchain
```

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Smart Contracts
```bash
npx hardhat compile
```
*(Hardhat automatically compiles contracts when running test or deployment scripts, but you can also compile manually.)*

### 3. Run Automated Tests
Execute the full 10-step integration test suite (runs on an in-memory simulated local chain):
```bash
npm run test
```
Or run stage-specific tests:
```bash
npm run test:stage1    # Stage 1: Registration and read getters
npm run test:stage2    # Stage 2: Lifecycle transitions and phase locks
```

### 4. Deploy to Persistent Local Node

#### **Terminal 1: Start the Local Hardhat Node**
```bash
npx hardhat node
```
*Leave this terminal running. It provides the local blockchain at `http://127.0.0.1:8545`.*

#### **Terminal 2: Deploy BlockPoll Contract**
```bash
npm run deploy:localhost
```
This script:
- Connects to `http://127.0.0.1:8545`.
- Deploys `BlockPoll` with the election title `"College Student Council Election 2026"`.
- Pre-seeds 3 sample candidates (Alice, Bob, Charlie).
- Pre-registers 3 sample local test accounts as voters.
- Prints the actual deployed contract address.

### 5. Verify Node Persistence
In a separate process, confirm that election title, candidate count, and all candidate records exist on the running node:
```bash
CONTRACT_ADDRESS=<deployed_address> npm run verify:localhost
```
Example:
```bash
CONTRACT_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853 npm run verify:localhost
```

---

## 7. Project Directory Structure

```text
blockchain/
├── contracts/
│   ├── BlockPoll.sol               # Main voting smart contract
│   └── HelloBlockchain.sol         # Starter template contract
├── docs/
│   ├── DEMO_SCRIPT.md              # 3-5 minute demonstration guide for professors
│   ├── VIVA_QUESTIONS.md           # 18 viva questions with concise answers
│   ├── TEST_CASES.md               # Formal test matrix & verification results
│   └── FRONTEND_INTEGRATION.md     # Web3 / Google Stitch integration handbook
├── scripts/
│   ├── deployBlockPoll.ts          # Deployment & seeding script for localhost
│   ├── testBlockPoll.ts            # Full end-to-end integration test suite
│   ├── testStage1.ts               # Unit test: Registration & getters
│   ├── testStage2.ts               # Unit test: Lifecycle & phase locks
│   └── verifyPersistence.ts        # Read-only persistence audit script
├── hardhat.config.ts               # Hardhat configuration (Solidity 0.8.34)
├── package.json                    # Scripts and dependencies
└── tsconfig.json                   # TypeScript configuration
```
