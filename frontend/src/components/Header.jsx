import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * Header - Shared broadside masthead, MetaMask wallet connection bar,
 * and view navigation tabs.
 */
export default function Header({
  electionName,
  adminAddress,
  currentView,
  onViewChange,
  walletState,
  voterStatus,
  onConnectWallet,
  onDisconnectWallet,
  isConnecting
}) {
  const isConnected = walletState.isConnected;
  const address = walletState.address;
  const isAdmin = isConnected && adminAddress && address.toLowerCase() === adminAddress.toLowerCase();
  const isRegisteredVoter = isConnected && voterStatus?.isRegistered;
  const hasVoted = isConnected && voterStatus?.hasVoted;

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: 'var(--border-width-thick) solid var(--color-border)',
        marginBottom: '2rem'
      }}
    >
      <div className="app-container" style={{ paddingBottom: '0.75rem', paddingTop: '1.25rem' }}>
        {/* Top Masthead metadata */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <span>BLOCKPOLL // TRANSPARENT BLOCKCHAIN VOTING SYSTEM</span>
          <span>EDUCATIONAL DEMONSTRATION // LOCAL ETHEREUM SANDBOX</span>
        </div>

        {/* Main Title Banner & Wallet Integration Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'var(--color-cobalt)',
                  color: '#FAF8F4',
                  fontWeight: 900,
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--color-border)',
                  borderRadius: '3px'
                }}
              >
                B
              </div>
              <span className="mono-label" style={{ fontSize: '0.8125rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ON-CHAIN CIVIC BALLOT
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', letterSpacing: '-0.02em' }}>
              {electionName || 'BlockPoll Election'}
            </h1>
          </div>

          {/* Connected Identity & Wallet Control Box */}
          <div
            className="paper-panel"
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              minWidth: '300px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>
                WALLET IDENTITY:
              </span>
              {isConnected ? (
                isAdmin ? (
                  <StatusBadge variant="admin">ADMIN (DEPLOYER)</StatusBadge>
                ) : isRegisteredVoter ? (
                  <StatusBadge variant="verified">
                    {hasVoted ? 'REGISTERED (VOTED)' : 'REGISTERED VOTER'}
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="not-started">GUEST (UNREGISTERED)</StatusBadge>
                )
              ) : (
                <StatusBadge variant="not-started">DISCONNECTED</StatusBadge>
              )}
            </div>

            {isConnected ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span className="mono-tag" style={{ fontSize: '0.8125rem', fontWeight: 700 }} title={address}>
                  {shortenAddress(address)}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={onDisconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.8125rem', padding: '0.45rem 0.8rem' }}
                onClick={onConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : '🦊 Connect MetaMask Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: 'var(--border-width) solid var(--color-border)',
            paddingBottom: '0'
          }}
          aria-label="Dashboard views"
        >
          <button
            type="button"
            className="btn"
            onClick={() => onViewChange('public')}
            style={{
              borderBottom: 'none',
              borderRadius: '4px 4px 0 0',
              backgroundColor: currentView === 'public' ? 'var(--color-canvas)' : 'var(--color-panel)',
              boxShadow: currentView === 'public' ? '2px -2px 0px #1C1B1A' : 'none'
            }}
          >
            1. Public Audit View
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => onViewChange('voter')}
            style={{
              borderBottom: 'none',
              borderRadius: '4px 4px 0 0',
              backgroundColor: currentView === 'voter' ? 'var(--color-canvas)' : 'var(--color-panel)',
              boxShadow: currentView === 'voter' ? '2px -2px 0px #1C1B1A' : 'none'
            }}
          >
            2. Voter Station
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => onViewChange('admin')}
            style={{
              borderBottom: 'none',
              borderRadius: '4px 4px 0 0',
              backgroundColor: currentView === 'admin' ? 'var(--color-canvas)' : 'var(--color-panel)',
              boxShadow: currentView === 'admin' ? '2px -2px 0px #1C1B1A' : 'none'
            }}
          >
            3. Admin Management
          </button>
        </nav>
      </div>
    </header>
  );
}
