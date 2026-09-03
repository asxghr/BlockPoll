# BlockPoll — Frontend Application

This is the **React + Vite** frontend for the **BlockPoll** transparent blockchain voting system.

---

## 1. Quick Start & Setup Flow

### Step 1: Start the Local Hardhat Blockchain Node
In your terminal, navigate to the `blockchain/` directory and run:
```bash
cd ../blockchain
npx hardhat node
```
*Leave this running. It serves the local JSON-RPC Ethereum node at `http://127.0.0.1:8545` (Chain ID: `31337`).*

### Step 2: Deploy the BlockPoll Smart Contract
In a second terminal:
```bash
cd ../blockchain
npm run deploy:localhost
```
Copy the printed contract address from the terminal output (e.g. `0x5FbDB2315678afecb367f032d93F642f64180aa3`).

### Step 3: Configure `.env.local`
In `frontend/`, copy `.env.example` to `.env.local` (or verify `frontend/.env.local` exists) and set your deployed contract address:
```env
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_RPC_URL=http://127.0.0.1:8545
VITE_CHAIN_ID=31337
```

### Step 4: Run the Frontend Development Server
In the `frontend/` directory:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 2. MetaMask Network Setup

> [!CAUTION]
> **LOCAL DEVELOPMENT ONLY:**
> The accounts and private keys provided by Hardhat are publicly known test accounts. **Never** import real cryptocurrency funds or use these keys on Ethereum Mainnet or public testnets.

To connect your browser wallet:
1. Open the MetaMask extension -> **Settings** -> **Networks** -> **Add Network Manually**:
   - **Network Name:** `Hardhat Localhost`
   - **New RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
2. Import a test account into MetaMask:
   - Account #0 (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) is the contract **Admin**.
   - Account #1 (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`) is a pre-whitelisted **Voter**.
   - Copy their private keys directly from the terminal where `npx hardhat node` was started.

---

## 3. Frontend Stage 2 Capabilities

- **Live On-Chain Data:** Reads election title, state, candidate roster, and vote counts directly from the smart contract via `ethers.js`.
- **MetaMask Wallet Integration:** Detects MetaMask presence, connects accounts, verifies network Chain ID (`31337`), and inspects real on-chain voter registration status.
- **Diagnostic Handling:** Warns if MetaMask is missing, wallet is disconnected, network mismatch occurs, or local node is offline.
- **Read-Only Scope:** In Stage 2, guest and voter interfaces are read-only. Transaction execution (`vote`, `registerCandidate`, `startElection`, etc.) will be activated in Frontend Stage 3.
