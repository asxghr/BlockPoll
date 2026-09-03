import React from 'react';
import CandidateCard from './CandidateCard';
import StatusBadge from './StatusBadge';

/**
 * VoterDashboard - Registered voter inspection station.
 * Queries and displays the connected wallet's real on-chain voter credentials.
 * Note: Transaction execution is disabled in Stage 2 as per specifications.
 */
export default function VoterDashboard({
  electionData,
  walletState,
  voterStatus,
  onConnectWallet
}) {
  const { candidates = [], state = 0 } = electionData;
  const isConnected = walletState.isConnected;
  const address = walletState.address;
  const isRegistered = isConnected && voterStatus?.isRegistered;
  const hasVoted = isConnected && voterStatus?.hasVoted;
  const votedCandidateId = voterStatus?.votedCandidateId || 0;
  const isOngoing = state === 1;

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <div>
      {/* Voter Credentials Verification Sheet */}
      <div
        className="paper-card"
        style={{
          marginBottom: '2rem',
          borderLeft: '6px solid var(--color-cobalt)',
          backgroundColor: '#FAF8F4'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <StatusBadge variant={isRegistered ? 'verified' : 'neutral'}>
                {isConnected ? (isRegistered ? 'ON-CHAIN VOTER DETECTED' : 'UNREGISTERED WALLET') : 'WALLET DISCONNECTED'}
              </StatusBadge>
              <span className="mono-label" style={{ fontSize: '0.8125rem' }}>
                CREDENTIALS VERIFIED VIA getVoterStatus()
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
              Voter Credential Station
            </h2>
            <p className="mono-tag" style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)' }}>
              Connected Wallet Address: <strong>{address || 'None (Connect MetaMask)'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <span className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
              BALLOT RECORD STATUS:
            </span>
            {!isConnected ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onConnectWallet}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                Connect Wallet
              </button>
            ) : hasVoted ? (
              <StatusBadge variant="ended">VOTED (CANDIDATE #{votedCandidateId})</StatusBadge>
            ) : isRegistered ? (
              isOngoing ? (
                <StatusBadge variant="ongoing">ELIGIBLE (NOT YET VOTED)</StatusBadge>
              ) : state === 0 ? (
                <StatusBadge variant="not-started">REGISTERED (POLLS NOT OPEN)</StatusBadge>
              ) : (
                <StatusBadge variant="ended">POLLS CLOSED</StatusBadge>
              )
            ) : (
              <StatusBadge variant="not-started">NOT WHITELISTED</StatusBadge>
            )}
          </div>
        </div>

        {/* Detailed Explanation Banner */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-panel)',
            fontSize: '0.875rem',
            color: '#423F3C'
          }}
        >
          {!isConnected ? (
            <p>
              Please connect your MetaMask wallet above. The dashboard will automatically query the smart contract's <code>voters</code> mapping to check your eligibility.
            </p>
          ) : !isRegistered ? (
            <p>
              ⚠️ <strong>Unregistered Wallet:</strong> Address <code>{address}</code> is not registered on the election whitelist. Only the administrator can whitelist voters before the election begins.
            </p>
          ) : hasVoted ? (
            <p>
              ✔ <strong>Vote Recorded On-Chain:</strong> This wallet has already cast its ballot for Candidate #{votedCandidateId}. Under smart contract rules, duplicate voting transactions are rejected.
            </p>
          ) : isOngoing ? (
            <p>
              ✔ <strong>Eligible Voter:</strong> This address is registered. <em>(Note: Voting transactions will be activated in Frontend Stage 3.)</em>
            </p>
          ) : state === 0 ? (
            <p>
              ⏳ <strong>Standby:</strong> The election has not started yet (State: 0). The administrator must call <code>startElection()</code> to open the voting booth.
            </p>
          ) : (
            <p>
              🛑 <strong>Closed:</strong> The election has ended (State: 2). No further ballots can be cast.
            </p>
          )}
        </div>
      </div>

      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
        <div>
          <span className="mono-tag" style={{ fontSize: '0.8125rem', color: 'var(--color-vermilion)', fontWeight: 700 }}>
            SECTION 02 // BALLOT ROSTER
          </span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>
            Candidate Standing
          </h2>
        </div>
        <span className="mono-label" style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)' }}>
          STAGE 2: READ-ONLY VOTER BOOTH
        </span>
      </div>

      {/* Candidates Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}
      >
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            totalVotes={totalVotes}
            electionState={state}
            userRole={hasVoted ? 'voter_voted' : isRegistered ? 'voter_unvoted' : 'guest'}
          />
        ))}
      </div>
    </div>
  );
}
