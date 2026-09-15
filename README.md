# BlockPoll: Transparent Blockchain Voting System

> **College Mini-Project Demonstration**  
> A decentralized, transparent electronic voting application built on Ethereum smart contracts. BlockPoll demonstrates how code-enforced rules on a distributed ledger prevent vote tampering, enforce one-person-one-vote rules, and allow transparent, independent tally auditing without a centralized database.

---

## 1. Project Overview

Traditional paper and centralized digital voting systems rely heavily on trust in central authorities, leaving them vulnerable to manual tally errors, database tampering, and voter list manipulation.

**BlockPoll** solves these core issues by running the election logic directly as an immutable **Solidity smart contract** on an Ethereum-compatible blockchain:
- **Rule Enforcement at Code Level:** No administrator or database manager can insert votes or change tallies once the rules are deployed.
- **Strict Election Lifecycle:** Voters and candidates can only be registered before voting begins. The moment the election starts, the roster is permanently locked.
- **One-Person, One-Vote:** Each whitelisted wallet address can cast exactly one ballot. Duplicate submissions are automatically rejected and reverted by the EVM.
- **Public Auditability:** Any student, teacher, or observer can connect to the ledger and verify candidate vote counts in real-time.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Smart Contract** | **Solidity (`^0.8.0`)** | Self-executing voting rules, voter mapping, candidate registry, and lifecycle states |
| **Blockchain Network** | **Hardhat v3 (`^3.15.0`)** | Local Ethereum JSON-RPC blockchain node (`http://127.0.0.1:8545`, Chain ID: `31337`) |
| **Blockchain Client** | **ethers.js v6 (`^6.17.0`)** | Signer transactions, contract calls, ABI decoding, and event listening |
| **Frontend Framework** | **React 19 + Vite 8** | Modern, responsive single-page web dashboard with civic editorial typography |
| **Wallet Integration** | **MetaMask Browser Extension** | Secure voter/admin key management and transaction signing |
| **Language / Tooling** | **TypeScript & JavaScript** | Type-safe deployment scripts, automated tests, and client logic |

*Note: No traditional backend database (e.g. MongoDB, PostgreSQL) is used for election state. The Ethereum blockchain is the single source of truth.*

---

## 3. Key Features

1. **Role-Based Views & Security:**
   - **Public Audit:** Read-only view showing live candidate standings, vote shares, and total ballots cast.
   - **Voter Station:** Automatic on-chain credential inspection (`getVoterStatus`). Eligible voters can select a candidate and cast an immutable vote.
   - **Admin Console:** Restricted to the contract deployer for candidate registration, voter whitelisting, starting, and ending the election.
2. **Transparent Lifecycle Management:**
   - `0: NotStarted` — Candidates and voters can be added. Voting is prohibited.
   - `1: Ongoing` — Registrations are permanently locked. Voting is enabled for registered accounts.
   - `2: Ended` — Polls are permanently closed. Tallies are final and immutable.
3. **Accurate Transaction Feedback:**
   - Step-by-step UI states: *Awaiting Wallet Signature*, *Transaction Broadcast (with TX hash)*, and *Ballot Confirmed On-Chain (with Block Number)*.
   - User rejection handling (MetaMask code 4001) and clear contract revert messages.
4. **Resilient Local Diagnostics:**
   - Instant visual banners when local node is offline, contract address is unconfigured, or wallet is connected to the wrong network.

---

## 4. Local Setup & Installation

### Prerequisites
- **Node.js** (v18.0.0 or later recommended)
- **npm** (v9.0.0 or later)
- **MetaMask** extension installed in Chrome, Brave, Edge, or Firefox

### Step 1: Clone Repository & Install Dependencies
Open a terminal in the project root:
```bash
cd /Users/asxghr/BlockPoll

# Install blockchain dependencies
cd blockchain
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 5. Deployment Workflow

### Step 1: Start the Local Blockchain Node
In **Terminal 1**, start the local Hardhat Ethereum node:
```bash
cd /Users/asxghr/BlockPoll/blockchain
npx hardhat node
```
*Keep this terminal running. It hosts your local blockchain at `http://127.0.0.1:8545` (Chain ID: `31337`).*

### Step 2: Deploy the BlockPoll Smart Contract
In **Terminal 2**, run the deployment script:
```bash
cd /Users/asxghr/BlockPoll/blockchain
npm run deploy:localhost
```
The script deploys `BlockPoll.sol`, sets Account #0 as the Admin, pre-seeds 3 sample candidates, and whitelists 3 test voters. It prints the deployed contract address:
```text
✔ BlockPoll successfully deployed!
  Actual Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Step 3: Configure Frontend Environment
Verify or update `/Users/asxghr/BlockPoll/frontend/.env.local`:
```env
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://127.0.0.1:8545
VITE_CHAIN_ID=31337
```

### Step 4: Start Frontend Dev Server
In **Terminal 2**:
```bash
cd /Users/asxghr/BlockPoll/frontend
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 6. MetaMask Configuration

1. In MetaMask, go to **Settings** → **Networks** → **Add Network Manually**:
   - **Network Name:** `Hardhat Localhost`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
2. Import test accounts from Hardhat (copy private keys from Terminal 1):
   - **Admin (Account #0):** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`  
     *Private Key:* `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - **Voter #1 (Account #1):** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`  
     *Private Key:* `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - **Voter #2 (Account #2):** `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`  
     *Private Key:* `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

---

## 7. Frontend Usage Workflow

1. **Public Dashboard (`/`):**
   - Read-only real-time metrics.
   - Displays live total votes, leader, and candidate percentage progress bars.
2. **Admin Console:**
   - Only active when connected with the contract Deployer account (`Account #0`).
   - Register new candidates (e.g. name & department).
   - Whitelist voter wallet addresses.
   - Start the election (`startElection()`) and conclude the election (`endElection()`).
3. **Voter Station:**
   - Displays real-time on-chain credentials: *Connected Address*, *Whitelist Status*, and *Ballot Record*.
   - When eligible, click **"Cast Ballot"** on any candidate card.
   - Review candidate details and voter address in the **Confirmation Modal**.
   - Confirm in MetaMask to write the vote to the blockchain.
   - UI updates instantly to mark the wallet as voted and highlights the chosen candidate.

---

## 8. Demo Script for Evaluators (3 Minutes)

| Time | Action | What to Explain to Professor / Evaluator |
| :--- | :--- | :--- |
| **0:00 - 0:45** | **Architecture & Node** | *"We have a local Ethereum blockchain running via Hardhat. Our smart contract is deployed at `0x5FbD...` without any intermediate database. The frontend talks directly to the node via ethers.js."* |
| **0:45 - 1:30** | **Admin Lifecycle** | Connect as **Account #0 (Admin)**. Open **Admin Console**. Show that the election is initially in state `0 (NotStarted)`. Click **"Start Election"**. Confirm in MetaMask. Show state transition to `1 (Ongoing)`. Point out that registrations are now locked. |
| **1:30 - 2:15** | **Voter Ballot Casting** | Switch MetaMask to **Account #1 (Voter #1)**. Go to **Voter Station**. Show badge `ELIGIBLE (NOT YET VOTED)`. Click **"Cast Ballot"** for Candidate #1. Verify modal shows candidate data and voter wallet address. Confirm transaction. Watch block confirmation and vote tally increment from 0 to 1. |
| **2:15 - 2:45** | **Double-Voting Prevention** | Attempt to click vote again or demonstrate that the button is disabled with `Ballot Already Cast`. Explain: *"The contract's `voters[msg.sender].hasVoted` flag guarantees that double voting is impossible at the bytecode level."* |
| **2:45 - 3:15** | **Public Audit Mode** | Switch to the **Public Audit** tab. Point out that anyone without a wallet can inspect final results with verified cryptographic integrity. |

---

## 9. Professor-Demo Checklist

Use this quick checklist before and during your demonstration:
- [ ] Hardhat node is running in Terminal 1 (`npx hardhat node`).
- [ ] Contract is deployed via `npm run deploy:localhost`.
- [ ] Contract address in `frontend/.env.local` matches deployed address.
- [ ] Frontend dev server is running on `http://localhost:5173`.
- [ ] MetaMask is connected to `Hardhat Localhost` (Chain ID `31337`).
- [ ] Account #0 (Admin) and Account #1 (Voter #1) are imported in MetaMask.
- [ ] Terminal test suite passes: `cd blockchain && npm test` (10/10 tests pass).
- [ ] Production build succeeds: `cd frontend && npm run build` (Clean build).

---

## 10. System Limitations

Because BlockPoll is designed as an educational mini-project for demonstration:
1. **Public Transparency vs. Ballot Secrecy:** Votes are linked to addresses on-chain (`voters[address].votedCandidateId`). Anyone viewing the blockchain ledger can see which address voted for which candidate.
2. **Single Election Scope:** The smart contract handles one election lifecycle (`NotStarted` $\to$ `Ongoing` $\to$ `Ended`). Creating a new election requires deploying a new contract instance.
3. **Centralized Admin Whitelisting:** The contract deployer manually registers candidates and voters.
4. **Development Sandbox:** Uses local Hardhat test private keys, which must never be used with real funds.

---

## 11. Future Scope & Anonymous Voting with Zero-Knowledge Proofs

To elevate BlockPoll to an enterprise or national voting standard, future iterations can introduce:

1. **Anonymous Voting via Zero-Knowledge Proofs (zk-SNARKs / Semaphore):**
   - **Problem:** Currently, voter addresses are linked to candidate choices.
   - **ZK Solution:** Eligible voters can generate a cryptographic proof off-chain (e.g. using Circom/SnarkJS) that proves: *"I am a registered voter in the Merkle tree of eligible voters, and I have not voted yet"*, without revealing *which* registered identity they are.
   - The contract verifies the zk-proof and records a nullifier hash, ensuring complete ballot secrecy while mathematically preventing double-voting.
2. **Decentralized Identity (DID) & Soulbound Tokens (SBT):**
   - Replace manual administrator whitelisting with university or institutional DID credentials or non-transferable Soulbound Tokens issued to valid students.
3. **Multi-Tenant Poll Factory:**
   - A factory smart contract allowing departments or clubs to independently deploy and manage multiple simultaneous elections.
4. **Mobile dApp Integration:**
   - WalletConnect integration to enable seamless mobile voting via MetaMask Mobile or Rainbow wallet.

---

## 12. Verification & Test Commands

### Run Smart Contract Integration Tests
```bash
cd /Users/asxghr/BlockPoll/blockchain
npm test
```
*Executes all 10 automated test suites covering registration rules, role enforcement, election lifecycles, and double-vote prevention.*

### Build Frontend for Production
```bash
cd /Users/asxghr/BlockPoll/frontend
npm run build
```
*Compiles all JSX components, checks bundle integrity, and builds static assets in `dist/`.*
