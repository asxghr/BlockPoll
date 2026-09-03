import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * NetworkBanner - Prominently displays connection status, alerts,
 * and remediation actions for:
 * - Deployed contract address missing/invalid
 * - Local Hardhat node unreachable
 * - Wrong network detected in MetaMask
 * - MetaMask extension not found
 */
export default function NetworkBanner({
  nodeHealth,
  contractAddressStatus,
  walletState,
  onConnectWallet,
  onSwitchNetwork,
  onRetryConnection
}) {
  // Case 1: Missing or invalid contract address in .env.local
  if (!contractAddressStatus.valid) {
    return (
      <div
        className="paper-card"
        style={{
          backgroundColor: '#FFF0ED',
          borderLeft: '6px solid var(--color-vermilion)',
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem'
        }}
        role="alert"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <StatusBadge variant="ended">CONFIGURATION ERROR</StatusBadge>
          <strong style={{ color: '#B02E16' }}>Missing or Invalid Contract Address</strong>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#4A1408', margin: '0.25rem 0' }}>
          The environment variable <code>VITE_CONTRACT_ADDRESS</code> is not set or not a valid Ethereum address.
        </p>
        <p className="mono-label" style={{ fontSize: '0.75rem', color: '#732A1C', marginTop: '0.25rem' }}>
          Solution: Deploy the contract via <code>npm run deploy:localhost</code> in <code>blockchain/</code>, copy the printed address, and set it in <code>frontend/.env.local</code>.
        </p>
      </div>
    );
  }

  // Case 2: Local Hardhat node is not reachable
  if (!nodeHealth.connected) {
    return (
      <div
        className="paper-card"
        style={{
          backgroundColor: '#FFF8E7',
          borderLeft: '6px solid #D4A017',
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
        role="alert"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <StatusBadge variant="not-started">NODE UNREACHABLE</StatusBadge>
            <strong style={{ color: '#7A5500' }}>Local Blockchain Node Offline</strong>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#5C4400', margin: '0.25rem 0' }}>
            Cannot connect to the JSON-RPC provider at <code>http://127.0.0.1:8545</code>.
          </p>
          <p className="mono-label" style={{ fontSize: '0.75rem', color: '#7A5500', marginTop: '0.25rem' }}>
            Remedy: Start the node in a terminal using: <code>cd blockchain &amp;&amp; npx hardhat node</code>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRetryConnection}
        >
          ↻ Retry Connection
        </button>
      </div>
    );
  }

  // Case 3: Connected to MetaMask on wrong network (not 31337)
  if (walletState.isConnected && !walletState.isCorrectChain) {
    return (
      <div
        className="paper-card"
        style={{
          backgroundColor: '#FFF0ED',
          borderLeft: '6px solid var(--color-vermilion)',
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
        role="alert"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <StatusBadge variant="ongoing">WRONG NETWORK</StatusBadge>
            <strong style={{ color: '#B02E16' }}>Chain ID Mismatch (Current: {walletState.chainId})</strong>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#4A1408', margin: '0.25rem 0' }}>
            Your wallet is connected to an external or incompatible network. BlockPoll requires the local Hardhat network (Chain ID: <strong>31337</strong>).
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSwitchNetwork}
        >
          Switch to Localhost (31337)
        </button>
      </div>
    );
  }

  // No blocking alerts
  return null;
}
