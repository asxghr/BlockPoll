import { ethers } from 'ethers';
import BlockPollAbi from '../contracts/BlockPollAbi.json';

// Local Blockchain Configuration
export const LOCAL_RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';
export const LOCAL_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 31337);
export const LOCAL_CHAIN_HEX = '0x' + LOCAL_CHAIN_ID.toString(16);

/**
 * Validates and retrieves the deployed contract address from .env.local
 */
export function getContractAddress() {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (!address || !ethers.isAddress(address)) {
    return null;
  }
  return address;
}

/**
 * Returns a read-only JsonRpcProvider connected to the local Hardhat node
 */
export function getReadOnlyProvider() {
  return new ethers.JsonRpcProvider(LOCAL_RPC_URL, {
    chainId: LOCAL_CHAIN_ID,
    name: 'hardhat-localhost'
  });
}

/**
 * Returns an ethers Contract instance connected to the read-only provider
 */
export function getReadOnlyContract() {
  const address = getContractAddress();
  if (!address) {
    throw new Error('CONTRACT_ADDRESS_INVALID');
  }
  const provider = getReadOnlyProvider();
  return new ethers.Contract(address, BlockPollAbi, provider);
}

/**
 * Checks if the local Hardhat node is running and reachable
 */
export async function checkLocalNodeHealth() {
  try {
    const provider = getReadOnlyProvider();
    const network = await provider.getNetwork();
    return {
      connected: true,
      chainId: Number(network.chainId)
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message || 'Unable to reach local Hardhat node at ' + LOCAL_RPC_URL
    };
  }
}

/**
 * Fetches all read-only election data from the smart contract.
 * Replaces mock claims with real on-chain state.
 */
export async function fetchLiveElectionData() {
  const contract = getReadOnlyContract();

  // Parallel queries to minimize latency
  const [
    rawName,
    rawAdmin,
    rawState,
    rawCandidateCount,
    rawCandidates,
    rawVoterCount
  ] = await Promise.all([
    contract.electionName(),
    contract.admin(),
    contract.state(),
    contract.candidateCount(),
    contract.getAllCandidates(),
    contract.getRegisteredVotersCount()
  ]);

  const candidateCount = Number(rawCandidateCount);
  const state = Number(rawState);
  const voterCount = Number(rawVoterCount);

  // Optional client-side presentation styling only (NOT from blockchain)
  const UI_PALETTE = ['#3156D3', '#EF5B3E', '#3A5100', '#7E22CE', '#0F766E', '#C2410C'];

  const candidates = rawCandidates.map((c, index) => {
    const id = Number(c.id);
    const fullName = c.name;
    const voteCount = Number(c.voteCount);

    return {
      id,
      name: fullName,
      voteCount,
      // Optional UI-only display metadata (clearly flagged as non-blockchain metadata)
      accentColor: UI_PALETTE[index % UI_PALETTE.length]
    };
  });

  return {
    electionName: rawName,
    adminAddress: rawAdmin,
    state, // 0 = NotStarted, 1 = Ongoing, 2 = Ended
    candidateCount,
    candidates,
    registeredVotersCount: voterCount
  };
}

/**
 * Queries the registration and voting status for a specific wallet address
 */
export async function fetchVoterStatus(walletAddress) {
  if (!walletAddress || !ethers.isAddress(walletAddress)) {
    return {
      isRegistered: false,
      hasVoted: false,
      votedCandidateId: 0
    };
  }

  const contract = getReadOnlyContract();
  const status = await contract.getVoterStatus(walletAddress);

  return {
    isRegistered: Boolean(status[0]),
    hasVoted: Boolean(status[1]),
    votedCandidateId: Number(status[2])
  };
}

/**
 * Checks if MetaMask / browser Ethereum provider is present
 */
export function isMetaMaskAvailable() {
  return typeof window !== 'undefined' && Boolean(window.ethereum);
}

/**
 * Requests wallet connection via MetaMask
 */
export async function connectMetaMaskWallet() {
  if (!isMetaMaskAvailable()) {
    throw new Error('METAMASK_UNAVAILABLE');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('NO_ACCOUNTS_FOUND');
  }

  const chainIdHex = await window.ethereum.request({
    method: 'eth_chainId'
  });

  const isCorrectChain = parseInt(chainIdHex, 16) === LOCAL_CHAIN_ID;

  return {
    address: accounts[0],
    chainId: parseInt(chainIdHex, 16),
    isCorrectChain
  };
}

/**
 * Prompts MetaMask to switch to or add the local Hardhat network (Chain ID: 31337)
 */
export async function switchMetaMaskToLocalNetwork() {
  if (!isMetaMaskAvailable()) {
    throw new Error('METAMASK_UNAVAILABLE');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: LOCAL_CHAIN_HEX }]
    });
    return true;
  } catch (switchError) {
    // Error code 4902 means the chain has not been added to MetaMask yet
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: LOCAL_CHAIN_HEX,
            chainName: 'Hardhat Localhost',
            rpcUrls: [LOCAL_RPC_URL],
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            }
          }
        ]
      });
      return true;
    }
    throw switchError;
  }
}

/**
 * Returns an ethers Contract instance connected to the user's active MetaMask signer.
 */
export async function getSignerContract() {
  if (!isMetaMaskAvailable()) {
    throw new Error('METAMASK_UNAVAILABLE');
  }
  const address = getContractAddress();
  if (!address) {
    throw new Error('CONTRACT_ADDRESS_INVALID');
  }
  const browserProvider = new ethers.BrowserProvider(window.ethereum);
  const signer = await browserProvider.getSigner();
  return new ethers.Contract(address, BlockPollAbi, signer);
}

/**
 * Parses Ethereum and contract transaction errors into human-readable messages.
 */
export function parseContractError(err) {
  if (!err) return 'An unknown error occurred.';

  // User rejected in MetaMask
  if (
    err.code === 4001 ||
    err.code === 'ACTION_REJECTED' ||
    err.message?.includes('user rejected') ||
    err.message?.includes('User rejected')
  ) {
    return 'Transaction was rejected in your wallet.';
  }

  // Contract revert reasons from ethers v6
  if (err.reason) {
    return err.reason;
  }
  if (err.shortMessage) {
    return err.shortMessage;
  }
  if (err.data?.message) {
    return err.data.message;
  }
  if (err.info?.error?.message) {
    return err.info.error.message;
  }

  // Fallback to error message
  const msg = err.message || '';
  if (msg.includes('Need at least 2 candidates')) {
    return 'Need at least 2 candidates to start the election.';
  }
  if (msg.includes('Candidate name cannot be empty')) {
    return 'Candidate name cannot be empty.';
  }
  if (msg.includes('Invalid voter address')) {
    return 'Invalid voter address.';
  }
  if (msg.includes('Voter is already registered')) {
    return 'This voter address is already registered.';
  }
  if (msg.includes('Only admin can perform this action')) {
    return 'Only the contract admin can perform this action.';
  }
  if (msg.includes('Cannot perform action after election starts')) {
    return 'Cannot register candidates or voters after the election has started.';
  }
  if (msg.includes('Election is not ongoing')) {
    return 'Election is not currently in the Ongoing state.';
  }

  return msg.split('\n')[0] || 'Transaction execution failed.';
}

/**
 * Admin Action 1: registerCandidate(name)
 */
export async function adminRegisterCandidate(name) {
  const trimmedName = (name || '').trim();
  if (!trimmedName) {
    throw new Error('Candidate name cannot be empty.');
  }

  const contract = await getSignerContract();
  const tx = await contract.registerCandidate(trimmedName);
  return tx;
}

/**
 * Admin Action 2: registerVoter(voterAddress)
 */
export async function adminRegisterVoter(voterAddress) {
  const trimmedAddress = (voterAddress || '').trim();
  if (!trimmedAddress || !ethers.isAddress(trimmedAddress)) {
    throw new Error('Please enter a valid 42-character Ethereum address (e.g. 0x...).');
  }

  const contract = await getSignerContract();
  const tx = await contract.registerVoter(trimmedAddress);
  return tx;
}

/**
 * Admin Action 3: startElection()
 */
export async function adminStartElection() {
  const contract = await getSignerContract();
  const tx = await contract.startElection();
  return tx;
}

/**
 * Admin Action 4: endElection()
 */
export async function adminEndElection() {
  const contract = await getSignerContract();
  const tx = await contract.endElection();
  return tx;
}

