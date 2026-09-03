import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import ConfirmationModal from './ConfirmationModal';
import { ethers } from 'ethers';

/**
 * AdminDashboard - Functional administrator terminal.
 * Enables smart-contract state mutations for deployer:
 * - registerCandidate(name)
 * - registerVoter(address)
 * - startElection()
 * - endElection()
 */
export default function AdminDashboard({
  electionData,
  walletState,
  onConnectWallet,
  onRegisterCandidate,
  onRegisterVoter,
  onStartElection,
  onEndElection,
  actionLoading = null // 'candidate', 'voter', 'start', 'end'
}) {
  const { candidates = [], state = 0, adminAddress = '', registeredVotersCount = 0 } = electionData;
  const isConnected = walletState.isConnected;
  const currentAddress = walletState.address || '';
  const isAdmin = isConnected && adminAddress && currentAddress.toLowerCase() === adminAddress.toLowerCase();

  const isNotStarted = state === 0;
  const isOngoing = state === 1;
  const isEnded = state === 2;

  // Form states
  const [candidateNameInput, setCandidateNameInput] = useState('');
  const [candidateError, setCandidateError] = useState('');

  const [voterAddressInput, setVoterAddressInput] = useState('');
  const [voterError, setVoterError] = useState('');

  // End election modal state
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  // Submit Candidate Registration
  const handleSubmitCandidate = async (e) => {
    e.preventDefault();
    const trimmed = candidateNameInput.trim();
    if (!trimmed) {
      setCandidateError('Candidate name cannot be empty.');
      return;
    }
    setCandidateError('');
    const success = await onRegisterCandidate(trimmed);
    if (success) {
      setCandidateNameInput('');
    }
  };

  // Submit Voter Enrollment
  const handleSubmitVoter = async (e) => {
    e.preventDefault();
    const trimmed = voterAddressInput.trim();
    if (!trimmed) {
      setVoterError('Voter address cannot be empty.');
      return;
    }
    if (!ethers.isAddress(trimmed)) {
      setVoterError('Invalid Ethereum address format (must start with 0x and be 42 characters).');
      return;
    }
    if (trimmed.toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
      setVoterError('Cannot register zero address (0x0000...).');
      return;
    }
    setVoterError('');
    const success = await onRegisterVoter(trimmed);
    if (success) {
      setVoterAddressInput('');
    }
  };

  // Confirm End Election
  const handleConfirmEndElection = async () => {
    const success = await onEndElection();
    if (success) {
      setIsEndModalOpen(false);
    }
  };

  return (
    <div>
      {/* Admin Terminal Header Banner */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <StatusBadge variant="admin">ADMINISTRATIVE PROTOCOL</StatusBadge>
              <span className="mono-label" style={{ fontSize: '0.8125rem' }}>
                VERIFIED CONTRACT ADMIN
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              Election Administration Terminal
            </h2>
            <p className="mono-tag" style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)' }}>
              On-Chain Admin Address: <strong>{adminAddress || 'Loading...'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
            <span className="mono-label" style={{ fontSize: '0.75rem', color: 'var(--color-ink-muted)' }}>
              ON-CHAIN STATE:
            </span>
            {isNotStarted && <StatusBadge variant="not-started">0: NotStarted (Registration Phase)</StatusBadge>}
            {isOngoing && <StatusBadge variant="ongoing">1: Ongoing (Polls Open)</StatusBadge>}
            {isEnded && <StatusBadge variant="ended">2: Ended (Polls Closed)</StatusBadge>}
          </div>
        </div>

        {/* Status of connected user vs admin */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-panel)',
            fontSize: '0.875rem'
          }}
        >
          {!isConnected ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ color: '#5C4400' }}>
                ℹ️ <strong>Wallet Disconnected:</strong> Connect MetaMask with Account #0 (<code>{adminAddress}</code>) to sign administrative transactions.
              </span>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onConnectWallet}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                Connect Admin Wallet
              </button>
            </div>
          ) : isAdmin ? (
            <p style={{ color: '#1B4D1B' }}>
              ✔ <strong>Admin Identity Confirmed:</strong> Connected wallet matches the smart contract deployer address. All controls below are active.
            </p>
          ) : (
            <p style={{ color: '#B02E16' }}>
              ⛔ <strong>Restricted Access:</strong> Your connected wallet (<code>{currentAddress}</code>) is not the contract administrator. Only <code>{adminAddress}</code> can sign administrative transactions.
            </p>
          )}
        </div>
      </div>

      {/* Grid: 3 Operational Modules */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Module 1: Lifecycle Controls */}
        <div className="paper-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="mono-tag" style={{ fontSize: '0.8125rem', color: 'var(--color-cobalt)', fontWeight: 700 }}>
              CONTROL 01 // LIFECYCLE LEVERS
            </span>
            <h3 style={{ fontSize: '1.25rem', margin: '0.4rem 0 0.5rem 0' }}>
              Phase Transitions
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', marginBottom: '1rem' }}>
              Current State: <strong>{state === 0 ? 'NotStarted (0)' : state === 1 ? 'Ongoing (1)' : 'Ended (2)'}</strong>.
            </p>

            <hr className="ink-rule-dashed" style={{ margin: '0.75rem 0 1.25rem 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Action: startElection() */}
              <div className="paper-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>1. Start Election</strong>
                  <span className="mono-label" style={{ fontSize: '0.7rem' }}>
                    startElection()
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', marginBottom: '0.75rem' }}>
                  Locks candidate and voter registration. Opens voting station to all whitelisted voters.
                </p>
                <button
                  type="button"
                  className="btn btn-chartreuse"
                  style={{ width: '100%', fontWeight: 700 }}
                  onClick={onStartElection}
                  disabled={!isAdmin || !isNotStarted || candidates.length < 2 || actionLoading !== null}
                >
                  {actionLoading === 'start' ? 'Confirming on Chain...' : '▶ startElection()'}
                </button>
                {candidates.length < 2 && isNotStarted && (
                  <span className="mono-label" style={{ fontSize: '0.7rem', color: '#B02E16', display: 'block', marginTop: '0.4rem' }}>
                    * Requires at least 2 registered candidates before starting.
                  </span>
                )}
              </div>

              {/* Action: endElection() */}
              <div className="paper-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>2. End Election</strong>
                  <span className="mono-label" style={{ fontSize: '0.7rem' }}>
                    endElection()
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-muted)', marginBottom: '0.75rem' }}>
                  Permanently closes all ballot submissions. Final tallies become immutable.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', backgroundColor: isOngoing ? 'var(--color-vermilion)' : undefined, fontWeight: 700 }}
                  onClick={() => setIsEndModalOpen(true)}
                  disabled={!isAdmin || !isOngoing || actionLoading !== null}
                >
                  {actionLoading === 'end' ? 'Confirming on Chain...' : '■ endElection()'}
                </button>
                {isEnded && (
                  <span className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)', display: 'block', marginTop: '0.4rem' }}>
                    Election has concluded. No further state transitions possible.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Register Candidate */}
        <div className="paper-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="mono-tag" style={{ fontSize: '0.8125rem', color: 'var(--color-cobalt)', fontWeight: 700 }}>
              CONTROL 02 // CANDIDATE REGISTRATION
            </span>
            <h3 style={{ fontSize: '1.25rem', margin: '0.4rem 0 0.5rem 0' }}>
              registerCandidate(name)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', marginBottom: '1rem' }}>
              Total Candidates Registered: <strong>{candidates.length}</strong> (IDs start at 1).
            </p>

            <hr className="ink-rule-dashed" style={{ margin: '0.75rem 0 1.25rem 0' }} />

            {!isNotStarted ? (
              <div className="paper-panel" style={{ backgroundColor: '#FFF8E7', color: '#5C4400', padding: '1rem' }}>
                <strong>Registration Closed:</strong> Candidate registration is strictly permitted only in <code>0: NotStarted</code> state.
              </div>
            ) : (
              <form onSubmit={handleSubmitCandidate}>
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="candidate-name-input"
                    className="mono-label"
                    style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 700 }}
                  >
                    CANDIDATE FULL NAME &amp; AFFILIATION:
                  </label>
                  <input
                    id="candidate-name-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Diana Prince (Civil Eng)"
                    value={candidateNameInput}
                    onChange={(e) => setCandidateNameInput(e.target.value)}
                    disabled={!isAdmin || actionLoading !== null}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                  {candidateError && (
                    <span className="mono-label" style={{ color: 'var(--color-vermilion)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                      {candidateError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={!isAdmin || !candidateNameInput.trim() || actionLoading !== null}
                >
                  {actionLoading === 'candidate' ? 'Submitting to Blockchain...' : '+ Register Candidate on Chain'}
                </button>
              </form>
            )}
          </div>

          {/* Current Roster Snippet */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-panel)', paddingTop: '0.75rem' }}>
            <span className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>
              CURRENT CANDIDATE LIST ({candidates.length}):
            </span>
            <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0, fontSize: '0.8125rem' }}>
              {candidates.map((c) => (
                <li key={c.id}>
                  <strong>#{c.id}</strong>: {c.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Module 3: Register Voter */}
        <div className="paper-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="mono-tag" style={{ fontSize: '0.8125rem', color: 'var(--color-cobalt)', fontWeight: 700 }}>
              CONTROL 03 // VOTER ENROLLMENT
            </span>
            <h3 style={{ fontSize: '1.25rem', margin: '0.4rem 0 0.5rem 0' }}>
              registerVoter(address)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-ink-muted)', marginBottom: '1rem' }}>
              Total Whitelisted Voters: <strong>{registeredVotersCount}</strong>.
            </p>

            <hr className="ink-rule-dashed" style={{ margin: '0.75rem 0 1.25rem 0' }} />

            {!isNotStarted ? (
              <div className="paper-panel" style={{ backgroundColor: '#FFF8E7', color: '#5C4400', padding: '1rem' }}>
                <strong>Enrollment Closed:</strong> Voter whitelisting is allowed only before voting begins (<code>0: NotStarted</code>).
              </div>
            ) : (
              <form onSubmit={handleSubmitVoter}>
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="voter-address-input"
                    className="mono-label"
                    style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 700 }}
                  >
                    VOTER WALLET ADDRESS (HEX):
                  </label>
                  <input
                    id="voter-address-input"
                    type="text"
                    className="form-input"
                    placeholder="0x..."
                    value={voterAddressInput}
                    onChange={(e) => setVoterAddressInput(e.target.value)}
                    disabled={!isAdmin || actionLoading !== null}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  />
                  {voterError && (
                    <span className="mono-label" style={{ color: 'var(--color-vermilion)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                      {voterError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={!isAdmin || !voterAddressInput.trim() || actionLoading !== null}
                >
                  {actionLoading === 'voter' ? 'Submitting to Blockchain...' : '+ Authorize Voter on Chain'}
                </button>
              </form>
            )}
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-panel)', paddingTop: '0.75rem' }}>
            <span className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--color-ink-muted)' }}>
              LOCAL TEST ACCOUNTS (HARDHAT):
            </span>
            <p className="mono-tag" style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: 'var(--color-ink-muted)' }}>
              Account #1 to #3 pre-registered on deployment. Any standard test address can be added.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Ending Election */}
      <ConfirmationModal
        isOpen={isEndModalOpen}
        title="Permanently End Election"
        description="Are you sure you want to end this election? Once ended, no further ballots can be cast and state transition to Ended (2) is permanent and irreversible."
        badgeText="CRITICAL ADMIN ACTION"
        confirmText="Yes, End Election Permanently"
        isDanger={true}
        onConfirm={handleConfirmEndElection}
        onClose={() => setIsEndModalOpen(false)}
        isProcessing={actionLoading === 'end'}
      />
    </div>
  );
}
