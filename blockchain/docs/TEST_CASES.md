# BlockPoll: Test Cases & Verification Matrix

This document provides the formal test matrix for the **BlockPoll** smart contract (`BlockPoll.sol`). All test cases are automated in `blockchain/scripts/testBlockPoll.ts`, `testStage1.ts`, and `testStage2.ts`.

---

## 1. Automated Test Matrix

| Test ID | Test Scenario / Action | Input / Caller | Expected Smart Contract Behavior | Observed Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Initial Admin Verification | Deployer | Deployer address stored in `admin`; `state` initialized to `0` (`NotStarted`). | Deployer address verified; state is `0`. | **PASS** |
| **TC-02** | Candidate Indexing Start | Admin (`"Alice Johnson"`) | First registered candidate receives `id = 1`; `candidateCount` increments to 1. | `id = 1`, `voteCount = 0`, `candidateCount = 1`. | **PASS** |
| **TC-03** | Empty Candidate Name | Admin (`""`) | Transaction reverts with `"Candidate name cannot be empty"`. | Reverted as expected with error. | **PASS** |
| **TC-04** | Non-Admin Candidate Reg | Non-Admin Account | Transaction reverts with `"Only admin can perform this action"`. | Reverted as expected. | **PASS** |
| **TC-05** | Valid Voter Registration | Admin (`voter1.address`) | `voters[voter1].isRegistered` set to `true`; address appended to `registeredVotersList`. | Voter registered; count increments. | **PASS** |
| **TC-06** | Duplicate Voter Registration | Admin (`voter1.address` again) | Transaction reverts with `"Voter is already registered"`. | Reverted as expected. | **PASS** |
| **TC-07** | Zero Address Voter Reg | Admin (`address(0)`) | Transaction reverts with `"Invalid voter address"`. | Reverted as expected. | **PASS** |
| **TC-08** | Non-Admin Voter Reg | Non-Admin Account | Transaction reverts with `"Only admin can perform this action"`. | Reverted as expected. | **PASS** |
| **TC-09** | Vote Before Election Start | Registered Voter 1 (`id = 1`) | Transaction reverts with `"Invalid action for current election state"` (`state == 0`). | Reverted as expected. | **PASS** |
| **TC-10** | Start Election with < 2 Candidates | Admin (only 0 or 1 candidate) | Transaction reverts with `"At least 2 candidates required to start election"`. | Reverted as expected. | **PASS** |
| **TC-11** | Non-Admin Start Election | Non-Admin Account | Transaction reverts with `"Only admin can perform this action"`. | Reverted as expected. | **PASS** |
| **TC-12** | Valid Election Start | Admin (2 candidates registered) | State transitions to `1` (`Ongoing`); emits `ElectionStarted`. | `state` equals `1`. | **PASS** |
| **TC-13** | Mid-Election Candidate Reg | Admin (`"Late Candidate"`) | Transaction reverts with `"Invalid action for current election state"` (`state == 1`). | Reverted as expected; registrations locked. | **PASS** |
| **TC-14** | Mid-Election Voter Reg | Admin (`voter_new.address`) | Transaction reverts with `"Invalid action for current election state"` (`state == 1`). | Reverted as expected; registrations locked. | **PASS** |
| **TC-15** | Unregistered Voter Casts Vote | Unregistered Address | Transaction reverts with `"You are not registered to vote"`. | Reverted as expected. | **PASS** |
| **TC-16** | Invalid Candidate ID (0) | Registered Voter 1 (`id = 0`) | Transaction reverts with `"Invalid candidate ID"`. | Reverted as expected (IDs start at 1). | **PASS** |
| **TC-17** | Out-of-Bounds Candidate ID | Registered Voter 1 (`id = 99`) | Transaction reverts with `"Invalid candidate ID"`. | Reverted as expected. | **PASS** |
| **TC-18** | Valid Vote Casting | Registered Voter 1 (`id = 1`) | Candidate 1 `voteCount` increments; voter `hasVoted = true`; records `votedCandidateId = 1`. | Vote cast successfully; event emitted. | **PASS** |
| **TC-19** | Double-Voting Prevention | Registered Voter 1 (`id = 2`) | Transaction reverts with `"You have already cast your vote"`. | Reverted as expected. | **PASS** |
| **TC-20** | Non-Admin End Election | Non-Admin Account | Transaction reverts with `"Only admin can perform this action"`. | Reverted as expected. | **PASS** |
| **TC-21** | Valid Election End | Admin | State transitions to `2` (`Ended`); emits `ElectionEnded`. | `state` equals `2`. | **PASS** |
| **TC-22** | Post-Election Voting Attempt | Registered Voter 2 (`id = 2`) | Transaction reverts with `"Invalid action for current election state"` (`state == 2`). | Reverted as expected. | **PASS** |
| **TC-23** | Final Results Tally Accuracy | Anyone | `getAllCandidates()` returns all candidate records with accurate vote tallies. | Candidate 1: 2 votes, Candidate 2: 1 vote. | **PASS** |

---

## 2. Test Execution Commands

Execute the test suite from `blockchain/`:
```bash
# Comprehensive integration test runner
npm run test

# Individual stage tests
npm run test:stage1
npm run test:stage2
```

### Verification Confirmation
- **Total Test Cases Executed:** 23
- **Passed:** 23
- **Failed:** 0
- **Exit Code:** `0` (Success)
