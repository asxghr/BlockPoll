import React from 'react';
import CandidateCard from './CandidateCard';
import StatusBadge from './StatusBadge';

/**
 * PublicDashboard - Read-only public audit view.
 * Powered by live on-chain contract data fetched from the local Hardhat node.
 */
export default function PublicDashboard({
  electionData,
  onSwitchToVoter
}) {
  const { candidates = [], state = 0, electionName = '', registeredVotersCount = 0 } = electionData;

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const leadingCandidate = candidates.length > 0
    ? [...candidates].sort((a, b) => b.voteCount - a.voteCount)[0]
    : null;

  return (
    <div>
      {/* Editorial Notice Banner */}
      <div
        className="paper-card"
        style={{
          backgroundColor: 'var(--color-panel)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <StatusBadge variant="neutral">PUBLIC AUDIT MODE</StatusBadge>
            <span className="mono-label" style={{ fontSize: '0.8125rem' }}>READ-ONLY ON-CHAIN LEDGER</span>
          </div>
          <p style={{ fontSize: '0.9375rem', color: '#33312E' }}>
            Welcome to the public transparent dashboard. All candidates and vote tallies below are read directly from the deployed smart contract.
            Guest users may inspect the ledger but cannot cast ballots.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSwitchToVoter}
        >
          Go to Voter Station →
        </button>
      </div>

      {/* Summary Metrics Row (Live Contract Data) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <span className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            REGISTERED CANDIDATES
          </span>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginTop: '0.25rem' }}>
            {candidates.length}
          </div>
          <span className="mono-tag" style={{ fontSize: '0.75rem' }}>
            IDs: 1 through {candidates.length || 0}
          </span>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <span className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            TOTAL ON-CHAIN VOTES
          </span>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-cobalt)' }}>
            {totalVotes}
          </div>
          <span className="mono-tag" style={{ fontSize: '0.75rem' }}>
            Verified Vote Sum
          </span>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <span className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            CURRENT PROJECTION LEADER
          </span>
          <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginTop: '0.25rem' }}>
            {leadingCandidate && leadingCandidate.voteCount > 0 ? leadingCandidate.name : 'Tie / No Votes Yet'}
          </div>
          <span className="mono-tag" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            {leadingCandidate ? `${leadingCandidate.voteCount} Votes Cast` : '0 Votes Cast'}
          </span>
        </div>

        <div className="paper-card" style={{ padding: '1.25rem' }}>
          <span className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
            WHITELISTED VOTER ROLL
          </span>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginTop: '0.25rem' }}>
            {registeredVotersCount}
          </div>
          <span className="mono-tag" style={{ fontSize: '0.75rem' }}>
            From getRegisteredVotersCount()
          </span>
        </div>
      </div>

      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
        <div>
          <span className="mono-tag" style={{ fontSize: '0.8125rem', color: 'var(--color-cobalt)', fontWeight: 700 }}>
            SECTION 01 // OFFICIAL ROSTER (getAllCandidates)
          </span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.25rem' }}>
            Candidate Standing & Live Vote Shares
          </h2>
        </div>
      </div>

      {/* Candidates Grid */}
      {candidates.length === 0 ? (
        <div className="paper-panel" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p className="mono-label">No candidates have been registered on-chain yet.</p>
        </div>
      ) : (
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
              userRole="guest"
            />
          ))}
        </div>
      )}
    </div>
  );
}
