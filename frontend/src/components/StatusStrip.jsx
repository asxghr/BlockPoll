import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * StatusStrip - Top secondary bar providing protocol, network, contract address,
 * and live on-chain state information.
 */
export default function StatusStrip({
  electionState = 0,
  contractAddress,
  nodeHealth,
  onRefresh,
  isRefreshing
}) {
  const stateLabels = {
    0: { text: '0: NotStarted (Registration Phase)', variant: 'not-started' },
    1: { text: '1: Ongoing (Voting Open)', variant: 'ongoing' },
    2: { text: '2: Ended (Polls Closed)', variant: 'ended' }
  };

  const currentState = stateLabels[electionState] || stateLabels[0];

  const shortenAddress = (addr) => {
    if (!addr) return 'Not Configured';
    return `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-panel)',
        borderBottom: '2px solid var(--color-border)',
        padding: '0.6rem 1.5rem',
        fontSize: '0.8125rem',
        fontFamily: 'var(--font-mono)'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        {/* Left: Network context & Contract address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: nodeHealth.connected ? '#22C55E' : '#EF4444'
              }}
            />
            <span>
              NODE: <strong>Hardhat Localhost (31337)</strong>
            </span>
          </div>

          <span style={{ color: 'var(--color-ink-muted)' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>CONTRACT:</span>
            <strong title={contractAddress}>{shortenAddress(contractAddress)}</strong>
          </div>

          <span style={{ color: 'var(--color-ink-muted)' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>ON-CHAIN STATE:</span>
            <StatusBadge variant={currentState.variant}>{currentState.text}</StatusBadge>
          </div>
        </div>

        {/* Right: Refresh button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              padding: '0.2rem 0.6rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {isRefreshing ? 'Fetching...' : '↻ Refresh On-Chain Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
