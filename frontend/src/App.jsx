import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatusStrip from './components/StatusStrip';
import NetworkBanner from './components/NetworkBanner';
import PublicDashboard from './components/PublicDashboard';
import VoterDashboard from './components/VoterDashboard';
import AdminDashboard from './components/AdminDashboard';
import TransactionFeedbackPanel from './components/TransactionFeedbackPanel';
import {
  getContractAddress,
  checkLocalNodeHealth,
  fetchLiveElectionData,
  fetchVoterStatus,
  isMetaMaskAvailable,
  connectMetaMaskWallet,
  switchMetaMaskToLocalNetwork,
  adminRegisterCandidate,
  adminRegisterVoter,
  adminStartElection,
  adminEndElection,
  parseContractError,
  LOCAL_CHAIN_ID
} from './services/contractService';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState('public'); // 'public', 'voter', 'admin'
  const [actionLoading, setActionLoading] = useState(null); // 'candidate', 'voter', 'start', 'end'
  const [electionData, setElectionData] = useState({
    electionName: 'Loading On-Chain Election...',
    adminAddress: '',
    state: 0,
    candidateCount: 0,
    candidates: [],
    registeredVotersCount: 0
  });

  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: null,
    chainId: null,
    isCorrectChain: false
  });

  const [voterStatus, setVoterStatus] = useState({
    isRegistered: false,
    hasVoted: false,
    votedCandidateId: 0
  });

  const [nodeHealth, setNodeHealth] = useState({
    connected: false,
    checking: true
  });

  const [contractAddressStatus, setContractAddressStatus] = useState({
    valid: false,
    address: null
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // 1. Initial Load & On-Chain Query
  const loadBlockchainData = useCallback(async () => {
    setIsRefreshing(true);
    const contractAddr = getContractAddress();
    setContractAddressStatus({
      valid: Boolean(contractAddr),
      address: contractAddr
    });

    if (!contractAddr) {
      setFeedback({
        type: 'error',
        title: 'Contract Address Missing',
        message: 'Please set VITE_CONTRACT_ADDRESS in frontend/.env.local.',
        details: 'Run npm run deploy:localhost in blockchain/ to deploy and copy the printed address.'
      });
      setIsRefreshing(false);
      return;
    }

    const health = await checkLocalNodeHealth();
    setNodeHealth({
      connected: health.connected,
      checking: false
    });

    if (!health.connected) {
      setFeedback({
        type: 'warning',
        title: 'Local Hardhat Node Offline',
        message: 'Cannot connect to http://127.0.0.1:8545.',
        details: 'Run "npx hardhat node" in the blockchain/ directory to start your local chain.'
      });
      setIsRefreshing(false);
      return;
    }

    try {
      const data = await fetchLiveElectionData();
      setElectionData(data);
      setFeedback(null); // Clear error if successful
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error Reading Smart Contract',
        message: err.message || 'Failed to read election data from the smart contract.',
        details: 'Verify that the contract is deployed to the running node at ' + contractAddr
      });
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 2. Fetch voter status for connected account
  const refreshVoterStatus = useCallback(async (accountAddress) => {
    if (!accountAddress) {
      setVoterStatus({
        isRegistered: false,
        hasVoted: false,
        votedCandidateId: 0
      });
      return;
    }

    try {
      const status = await fetchVoterStatus(accountAddress);
      setVoterStatus(status);
    } catch (err) {
      console.warn('Error fetching voter status:', err);
    }
  }, []);

  // 3. Mount Effect: Load data and check existing wallet connection
  useEffect(() => {
    loadBlockchainData();

    if (isMetaMaskAvailable() && typeof window.ethereum?.request === 'function') {
      try {
        window.ethereum
          .request({ method: 'eth_accounts' })
          .then((accounts) => {
            if (accounts && accounts.length > 0) {
              if (typeof window.ethereum?.request === 'function') {
                window.ethereum
                  .request({ method: 'eth_chainId' })
                  .then((chainIdHex) => {
                    const chainId = parseInt(chainIdHex, 16);
                    const isCorrectChain = chainId === LOCAL_CHAIN_ID;
                    setWalletState({
                      isConnected: true,
                      address: accounts[0],
                      chainId,
                      isCorrectChain
                    });
                    refreshVoterStatus(accounts[0]);
                  })
                  .catch(console.warn);
              }
            }
          })
          .catch(console.warn);
      } catch (err) {
        console.warn('Initial wallet check error:', err);
      }

      // Listen for account changes
      const handleAccountsChanged = (accounts) => {
        if (!accounts || accounts.length === 0) {
          setWalletState({
            isConnected: false,
            address: null,
            chainId: null,
            isCorrectChain: false
          });
          setVoterStatus({ isRegistered: false, hasVoted: false, votedCandidateId: 0 });
        } else {
          setWalletState((prev) => ({
            ...prev,
            isConnected: true,
            address: accounts[0]
          }));
          refreshVoterStatus(accounts[0]);
        }
      };

      // Listen for network changes
      const handleChainChanged = (chainIdHex) => {
        const chainId = parseInt(chainIdHex, 16);
        const isCorrectChain = chainId === LOCAL_CHAIN_ID;
        setWalletState((prev) => ({
          ...prev,
          chainId,
          isCorrectChain
        }));
        loadBlockchainData();
      };

      let hasSubscribed = false;
      try {
        if (typeof window.ethereum?.on === 'function') {
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          hasSubscribed = true;
        }
      } catch (e) {
        console.warn('Could not register wallet event listeners:', e);
      }

      return () => {
        if (hasSubscribed) {
          try {
            if (typeof window.ethereum?.removeListener === 'function') {
              window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
              window.ethereum.removeListener('chainChanged', handleChainChanged);
            } else if (typeof window.ethereum?.off === 'function') {
              window.ethereum.off('accountsChanged', handleAccountsChanged);
              window.ethereum.off('chainChanged', handleChainChanged);
            }
          } catch (e) {
            console.warn('Could not unregister wallet event listeners:', e);
          }
        }
      };
    }
  }, [loadBlockchainData, refreshVoterStatus]);

  // Handler: Connect MetaMask Wallet
  const handleConnectWallet = async () => {
    if (!isMetaMaskAvailable()) {
      setFeedback({
        type: 'warning',
        title: 'MetaMask Not Detected',
        message: 'MetaMask browser extension was not detected. Please install MetaMask to test wallet connection.',
        details: 'You can still explore all candidate tallies and election data in read-only public guest mode.'
      });
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectMetaMaskWallet();
      setWalletState({
        isConnected: true,
        address: result.address,
        chainId: result.chainId,
        isCorrectChain: result.isCorrectChain
      });

      if (!result.isCorrectChain) {
        setFeedback({
          type: 'warning',
          title: 'Incorrect Network',
          message: `Connected to Chain ID ${result.chainId}. Please switch to Hardhat Localhost (${LOCAL_CHAIN_ID}).`,
          details: null
        });
      } else {
        setFeedback({
          type: 'success',
          title: 'Wallet Connected',
          message: `Connected account: ${result.address}`,
          details: null
        });
      }

      await refreshVoterStatus(result.address);
    } catch (err) {
      if (err.code === 4001) {
        setFeedback({
          type: 'info',
          title: 'Connection Cancelled',
          message: 'Wallet connection request was rejected in MetaMask.',
          details: null
        });
      } else {
        setFeedback({
          type: 'error',
          title: 'Wallet Connection Error',
          message: err.message || 'Failed to connect MetaMask.',
          details: null
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Handler: Switch MetaMask to local Hardhat network
  const handleSwitchNetwork = async () => {
    try {
      await switchMetaMaskToLocalNetwork();
      setWalletState((prev) => ({
        ...prev,
        chainId: LOCAL_CHAIN_ID,
        isCorrectChain: true
      }));
      setFeedback({
        type: 'success',
        title: 'Network Switched',
        message: 'Successfully connected to Hardhat Localhost (31337).',
        details: null
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Failed to Switch Network',
        message: err.message || 'Could not switch MetaMask network.',
        details: 'You can add network manually: RPC http://127.0.0.1:8545, Chain ID 31337.'
      });
    }
  };

  // Handler: Disconnect wallet (UI state reset)
  const handleDisconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      isCorrectChain: false
    });
    setVoterStatus({
      isRegistered: false,
      hasVoted: false,
      votedCandidateId: 0
    });
    setFeedback({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'Switched to read-only guest browsing mode.',
      details: null
    });
  };

  // Pre-flight check before submitting admin transactions
  const ensureAdminAuthorized = () => {
    if (!walletState.isConnected || !walletState.address) {
      setFeedback({
        type: 'warning',
        title: 'Wallet Disconnected',
        message: 'Please connect your MetaMask wallet with Account #0 (Admin) to perform this action.',
        details: null
      });
      return false;
    }

    if (!walletState.isCorrectChain) {
      setFeedback({
        type: 'warning',
        title: 'Incorrect Network',
        message: `Please switch your wallet to Hardhat Localhost (Chain ID ${LOCAL_CHAIN_ID}).`,
        details: null
      });
      return false;
    }

    if (
      !electionData.adminAddress ||
      walletState.address.toLowerCase() !== electionData.adminAddress.toLowerCase()
    ) {
      setFeedback({
        type: 'error',
        title: 'Admin Authorization Required',
        message: `Only the smart contract deployer (${electionData.adminAddress}) can sign this transaction.`,
        details: `Your connected wallet: ${walletState.address}`
      });
      return false;
    }

    return true;
  };

  // Handler 1: Register Candidate
  const handleRegisterCandidate = async (name) => {
    if (!ensureAdminAuthorized()) return false;

    setActionLoading('candidate');
    setFeedback({
      type: 'info',
      title: 'Awaiting Wallet Confirmation',
      message: `Confirm registration of candidate "${name}" in MetaMask...`,
      details: null
    });

    try {
      const tx = await adminRegisterCandidate(name);
      setFeedback({
        type: 'info',
        title: 'Transaction Broadcast',
        message: `Candidate registration submitted. Waiting for local block confirmation...`,
        details: `Tx Hash: ${tx.hash}`
      });

      const receipt = await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Candidate Registered On-Chain!',
        message: `Candidate "${name}" successfully registered in block #${receipt.blockNumber}!`,
        details: `Tx: ${tx.hash}`
      });

      await loadBlockchainData();
      return true;
    } catch (err) {
      const errorMsg = parseContractError(err);
      setFeedback({
        type: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'info' : 'error',
        title: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'Registration Cancelled' : 'Registration Failed',
        message: errorMsg,
        details: null
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  // Handler 2: Register Voter
  const handleRegisterVoter = async (voterAddress) => {
    if (!ensureAdminAuthorized()) return false;

    setActionLoading('voter');
    setFeedback({
      type: 'info',
      title: 'Awaiting Wallet Confirmation',
      message: `Confirm whitelisting of voter ${voterAddress} in MetaMask...`,
      details: null
    });

    try {
      const tx = await adminRegisterVoter(voterAddress);
      setFeedback({
        type: 'info',
        title: 'Transaction Broadcast',
        message: `Voter whitelisting submitted. Waiting for local block confirmation...`,
        details: `Tx Hash: ${tx.hash}`
      });

      const receipt = await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Voter Registered On-Chain!',
        message: `Voter address whitelisted in block #${receipt.blockNumber}!`,
        details: `Tx: ${tx.hash}`
      });

      await loadBlockchainData();
      return true;
    } catch (err) {
      const errorMsg = parseContractError(err);
      setFeedback({
        type: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'info' : 'error',
        title: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'Whitelisting Cancelled' : 'Whitelisting Failed',
        message: errorMsg,
        details: null
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  // Handler 3: Start Election
  const handleStartElection = async () => {
    if (!ensureAdminAuthorized()) return false;

    setActionLoading('start');
    setFeedback({
      type: 'info',
      title: 'Awaiting Wallet Confirmation',
      message: 'Confirm opening of election in MetaMask...',
      details: null
    });

    try {
      const tx = await adminStartElection();
      setFeedback({
        type: 'info',
        title: 'Transaction Broadcast',
        message: 'startElection() submitted. Waiting for local block confirmation...',
        details: `Tx Hash: ${tx.hash}`
      });

      const receipt = await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Election Started!',
        message: `Election state is now 1: Ongoing! Polls are officially open. (Block #${receipt.blockNumber})`,
        details: `Tx: ${tx.hash}`
      });

      await loadBlockchainData();
      return true;
    } catch (err) {
      const errorMsg = parseContractError(err);
      setFeedback({
        type: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'info' : 'error',
        title: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'Start Cancelled' : 'Failed to Start Election',
        message: errorMsg,
        details: null
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  // Handler 4: End Election
  const handleEndElection = async () => {
    if (!ensureAdminAuthorized()) return false;

    setActionLoading('end');
    setFeedback({
      type: 'info',
      title: 'Awaiting Wallet Confirmation',
      message: 'Confirm permanent closure of election in MetaMask...',
      details: null
    });

    try {
      const tx = await adminEndElection();
      setFeedback({
        type: 'info',
        title: 'Transaction Broadcast',
        message: 'endElection() submitted. Waiting for local block confirmation...',
        details: `Tx Hash: ${tx.hash}`
      });

      const receipt = await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Election Concluded!',
        message: `Election state is now 2: Ended. Voting is closed and final tallies are immutable. (Block #${receipt.blockNumber})`,
        details: `Tx: ${tx.hash}`
      });

      await loadBlockchainData();
      return true;
    } catch (err) {
      const errorMsg = parseContractError(err);
      setFeedback({
        type: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'info' : 'error',
        title: err.code === 4001 || err.code === 'ACTION_REJECTED' ? 'End Cancelled' : 'Failed to End Election',
        message: errorMsg,
        details: null
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Status & Network Bar */}
      <StatusStrip
        electionState={electionData.state}
        contractAddress={contractAddressStatus.address}
        nodeHealth={nodeHealth}
        onRefresh={loadBlockchainData}
        isRefreshing={isRefreshing}
      />

      {/* Shared Masthead & View Selector */}
      <Header
        electionName={electionData.electionName}
        adminAddress={electionData.adminAddress}
        currentView={currentView}
        onViewChange={setCurrentView}
        walletState={walletState}
        voterStatus={voterStatus}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        isConnecting={isConnecting}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1 }}>
        {/* Network & Configuration Diagnostic Alert Banner */}
        <NetworkBanner
          nodeHealth={nodeHealth}
          contractAddressStatus={contractAddressStatus}
          walletState={walletState}
          onConnectWallet={handleConnectWallet}
          onSwitchNetwork={handleSwitchNetwork}
          onRetryConnection={loadBlockchainData}
        />

        {/* Real-time Feedback Banner */}
        <TransactionFeedbackPanel
          feedback={feedback}
          onDismiss={() => setFeedback(null)}
        />

        {/* View Routing */}
        {currentView === 'public' && (
          <PublicDashboard
            electionData={electionData}
            onSwitchToVoter={() => setCurrentView('voter')}
          />
        )}

        {currentView === 'voter' && (
          <VoterDashboard
            electionData={electionData}
            walletState={walletState}
            voterStatus={voterStatus}
            onConnectWallet={handleConnectWallet}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            electionData={electionData}
            walletState={walletState}
            onConnectWallet={handleConnectWallet}
            onRegisterCandidate={handleRegisterCandidate}
            onRegisterVoter={handleRegisterVoter}
            onStartElection={handleStartElection}
            onEndElection={handleEndElection}
            actionLoading={actionLoading}
          />
        )}
      </main>

      {/* Broadside Footer */}
      <footer
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: 'var(--border-width-thick) solid var(--color-border)',
          padding: '1.5rem 0',
          marginTop: 'auto',
          fontSize: '0.8125rem',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div
          className="app-container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div>
            <strong>BLOCKPOLL SYSTEM</strong> — Transparent Local Blockchain Voting
          </div>
          <div style={{ color: 'var(--color-ink-muted)' }}>
            Stage 2: Live Read-Only Contract Queries // ethers.js v6 // Hardhat 31337
          </div>
        </div>
      </footer>
    </div>
  );
}
