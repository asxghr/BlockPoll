# BlockPoll: Viva Voce Questions & Answers

A collection of 18 essential viva questions and concise answers covering the blockchain concepts, smart contract architecture, and design choices used in **BlockPoll**.

---

### Q1: What is a smart contract, and how is it used in BlockPoll?
**Answer:** A smart contract is a self-executing program deployed on a blockchain that runs automatically when predetermined conditions are met. In BlockPoll, the contract (`BlockPoll.sol`) manages the entire voting lifecycle, voter registration, vote validation, and tallying without requiring an intermediary database or backend server.

---

### Q2: Why is the deployer designated as the admin, and how is this enforced?
**Answer:** In the contract constructor, `admin = msg.sender;` assigns the deploying wallet address to an `immutable` admin variable. A modifier `onlyAdmin()` checks `require(msg.sender == admin, "Only admin can perform this action");` before executing restricted functions such as registering candidates, registering voters, starting, or ending the election.

---

### Q3: How does BlockPoll prevent a voter from voting twice?
**Answer:** The contract maintains a mapping `mapping(address => Voter) public voters`. When an eligible voter casts a ballot, the contract checks `require(!voters[msg.sender].hasVoted, "You have already cast your vote");`. Upon voting, it immediately marks `voters[msg.sender].hasVoted = true;`. Any subsequent transaction from that address is automatically reverted by the EVM.

---

### Q4: What are the three lifecycle states of the election, and why are they necessary?
**Answer:** The lifecycle is controlled by an enum `enum ElectionState { NotStarted, Ongoing, Ended }`:
1. **`NotStarted` (0):** Allows admin registration of candidates and voters; blocks voting.
2. **`Ongoing` (1):** Locks registrations permanently; allows registered voters to cast one vote.
3. **`Ended` (2):** Freezes all voting and state modifications; preserves immutable final results.
This state machine prevents voter list tampering after an election has begun.

---

### Q5: What is a `struct` in Solidity, and what structs are used in BlockPoll?
**Answer:** A `struct` is a custom user-defined data type that groups several related variables together:
- `Candidate`: Contains `uint256 id`, `string name`, and `uint256 voteCount`.
- `Voter`: Contains `bool isRegistered`, `bool hasVoted`, and `uint256 votedCandidateId`.

---

### Q6: What is a `mapping` in Solidity, and why is it preferred over an array for voters?
**Answer:** A `mapping` is a hash table that provides $O(1)$ constant-time key-value lookups. Using `mapping(address => Voter) public voters` allows the contract to instantly check voter registration and vote status by address without looping through an unbounded array, saving gas and preventing out-of-gas errors.

---

### Q7: Why does BlockPoll also keep an array `address[] public registeredVotersList` alongside the mapping?
**Answer:** In Solidity, mappings cannot be iterated over because keys are hashed and not stored in sequence. The `registeredVotersList` array tracks registered voter addresses to enable public queries such as `getRegisteredVotersCount()`.

---

### Q8: What are Solidity Events, and why are they used in BlockPoll?
**Answer:** Events (e.g., `VoteCasted`, `CandidateRegistered`) allow smart contracts to log indexed data to the blockchain transaction receipt logs. They provide a low-gas audit trail and allow frontend applications (using ethers.js) to subscribe and react in real-time to state changes.

---

### Q9: Why do Candidate IDs start at 1 instead of 0?
**Answer:** In Solidity, uninitialized `uint256` variables default to `0`. If candidate IDs started at 0, a voter struct with `votedCandidateId = 0` would be indistinguishable from a voter who has not voted. Starting at 1 ensures candidate ID 0 remains an unambiguous default sentinel value.

---

### Q10: What is Hardhat, and why was it chosen for this project?
**Answer:** Hardhat is a development environment for Ethereum software. It provides a local node (`npx hardhat node`) that simulates the Ethereum network on `localhost:8545`, along with compilation tools, test runners, and script execution capabilities without requiring real cryptocurrency or gas fees.

---

### Q11: What is the role of `ethers.js` in BlockPoll?
**Answer:** `ethers.js` is a lightweight library that enables client applications and Node.js scripts to communicate with the Ethereum blockchain. It connects to the JSON-RPC provider, signs transactions with wallet signers, and encodes/decodes calls to smart contract functions using the contract ABI.

---

### Q12: What is a Contract ABI, and where is it located?
**Answer:** The Application Binary Interface (ABI) is a JSON format specification defining the contract functions, parameters, return types, and events. It serves as the translation bridge between client applications and the low-level EVM bytecode. In Hardhat, it is generated at `blockchain/artifacts/contracts/BlockPoll.sol/BlockPoll.json`.

---

### Q13: What happens if an unregistered wallet tries to vote?
**Answer:** In `vote(uint256 _candidateId)`, the contract asserts `require(voters[msg.sender].isRegistered, "You are not registered to vote");`. If `isRegistered` is false, the transaction reverts. A reverted transaction discards all contract state changes. On a real Ethereum network, it can still consume gas for the computation performed before the revert. In this local Hardhat project, no real cryptocurrency is spent.

---

### Q14: Is vote data anonymous in BlockPoll?
**Answer:** **No.** BlockPoll is designed as an educational, transparent voting prototype. The contract records `voters[msg.sender].votedCandidateId` and emits `VoteCasted(msg.sender, candidateId)`. All transactions and logs on the blockchain are publicly visible, meaning anyone can see which address voted for which candidate.

---

### Q15: How could voter anonymity be achieved in an advanced production system?
**Answer:** Production anonymous voting typically utilizes Zero-Knowledge Proofs (ZK-SNARKs) or cryptographic blind signatures. With ZKPs, a voter proves membership in the registered voter set without revealing their identity or linking their wallet address to the ballot cast.

---

### Q16: Can the admin change someone's vote or tamper with the final tally?
**Answer:** The admin cannot directly change an already recorded vote, reset voting status, or edit vote counts because no such functions exist. However, the admin does control candidate/voter registration before voting begins and can end an ongoing election. This is a deliberate limitation of the educational prototype.

---

### Q17: What is the difference between `network.connect()` and `network.create()` in Hardhat v3?
**Answer:**
- `network.create()` spins up a brand new, isolated in-memory simulated network each time it is called.
- `network.connect()` connects to the network specified by the CLI flags (e.g., `--network localhost` pointing to `http://127.0.0.1:8545`), allowing deployed contracts and state to persist across multiple script runs and frontend sessions.

---

### Q18: What are the main limitations of the BlockPoll prototype?
**Answer:**
1. **Lack of ballot anonymity:** Votes are linked to public wallet addresses.
2. **Centralized registration:** The admin alone approves voters and candidates.
3. **Single election lifecycle:** The contract handles one election and cannot be reused for subsequent elections without redeploying.
4. **Local network scope:** Configured for local development on Hardhat (`chainId: 31337`) using publicly known test private keys.
