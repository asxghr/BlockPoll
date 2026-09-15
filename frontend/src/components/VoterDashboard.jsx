import React, { useState } from 'react';
import CandidateCard from './CandidateCard';
import StatusBadge from './StatusBadge';
import ConfirmationModal from './ConfirmationModal';

/**
 * VoterDashboard - Registered voter inspection and ballot casting station.
 * Queries and displays the connected wallet's real on-chain voter credentials,
 * and allows eligible registered voters to submit real on-chain ballots.
 */
export default function VoterDashboard({
  electionData,
  walletState,
  voterStatus,
  onConnectWallet,
  onCastVote,
  isVoting = false,
  onSwitchNetwork
}) {
  const { candidates = [], state = 0 } = electionData;
  const isConnected = walletState.isConnected;
  const isCorrectChain = walletState.isCorrectChain;
  const address = walletState.address;
  const isRegistered = isConnected && voterStatus?.isRegistered;
  const hasVoted = isConnected && voterStatus?.hasVoted;
  const votedCandidateId = voterStatus?.votedCandidateId || 0;
  const isOngoing = state === 1;

  // Track modal state locally
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Voting eligibility computation
  const canVote = isConnected && isCorrectChain && isOngoing && isRegistered && !hasVoted && !isVoting;

  // Contextual disabled reason for candidates
  let votingDisabledReason = '';
  if (!isConnected) {
    votingDisabledReason = 'Connect Wallet to Vote';
  } else if (!isCorrectChain) {
    votingDisabledReason = 'Switch to Local Network';
  } else if (state === 0) {
    votingDisabledReason = 'Polls Not Open (State: 0)';
  } else if (state === 2) {
    votingDisabledReason = 'Polls Closed (State: 2)';
  } else if (!isRegistered) {
    votingDisabledReason = 'Address Not Whitelisted';
  } else if (hasVoted) {
    votingDisabledReason = 'Ballot Already Cast';
  } else if (isVoting) {
    votingDisabledReason = 'Confirming in Wallet...';
  }

  const handleSelectCandidate = (candidate) => {
    if (!canVote) return;
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate || !onCastVote) return;
    const success = await onCastVote(selectedCandidate.id);
    if (success) {
      setIsModalOpen(false);
      setSelectedCandidate(null);
    }
  };

  const handleCloseModal = () => {
    if (isVoting) return;
    setIsModalOpen(false);
  };

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
            ) : !isCorrectChain ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onSwitchNetwork}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: 'var(--color-vermilion)' }}
              >
                Switch Network (31337)
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
          ) : !isCorrectChain ? (
            <p>
              ⚠️ <strong>Incorrect Network:</strong> Connected to Chain ID {walletState.chainId}. Please switch MetaMask to <strong>Hardhat Localhost (31337)</strong> to cast votes.
            </p>
          ) : !isRegistered ? (
            <p>
              ⚠️ <strong>Unregistered Wallet:</strong> Address <code>{address}</code> is not registered on the election whitelist. Only the administrator can whitelist voters before the election begins.
            </p>
          ) : hasVoted ? (
            <p>
              ✔ <strong>Vote Recorded On-Chain:</strong> This wallet has cast its ballot for Candidate #{votedCandidateId}. Under smart contract rules, duplicate voting transactions are rejected.
            </p>
          ) : isOngoing ? (
            <p>
              ✔ <strong>Eligible Voter:</strong> Your wallet is verified on the smart contract whitelist. Select any candidate from the roster below and click <strong>"Cast Ballot"</strong> to submit your official vote.
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
          OFFICIAL BALLOT BOOTH
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
            canVote={canVote}
            onVoteClick={handleSelectCandidate}
            votingDisabledReason={votingDisabledReason}
            isVotedByMe={hasVoted && votedCandidateId === candidate.id}
          />
        ))}
      </div>

      {/* Voter Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        candidate={selectedCandidate}
        voterAddress={address}
        title="Confirm Ballot Submission"
        description="You are about to cast your official ballot for the candidate below. Once submitted, your vote is permanently written to the blockchain ledger and cannot be altered or re-cast."
        badgeText="OFFICIAL BALLOT CONFIRMATION"
        confirmText="Yes, Cast Vote"
        onConfirm={handleConfirmVote}
        onClose={handleCloseModal}
        isProcessing={isVoting}
      />
    </div>
  );
}
