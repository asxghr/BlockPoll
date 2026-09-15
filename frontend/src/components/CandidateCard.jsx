import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * CandidateCard - Component displaying real on-chain candidate data
 * (ID, Name, and VoteCount) alongside neutral offline SVG avatars and optional UI styling.
 */
export default function CandidateCard({
  candidate,
  totalVotes = 0,
  electionState = 0, // 0 = NotStarted, 1 = Ongoing, 2 = Ended
  userRole = 'guest', // 'guest', 'voter_unvoted', 'voter_voted', 'admin'
  canVote = false,
  onVoteClick = null,
  votingDisabledReason = '',
  isVotedByMe = false
}) {
  const { id, name, voteCount, accentColor = '#3156D3' } = candidate;
  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  // Extract initials for the neutral local avatar seal
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('') || 'C';

  const isOngoing = electionState === 1;

  return (
    <div
      className="paper-card candidate-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: `6px solid ${accentColor}`,
        boxShadow: isVotedByMe ? '0 0 0 2px var(--color-chartreuse), 4px 4px 0px #1C1B1A' : undefined
      }}
    >
      <div>
        {/* Card Header: Candidate ID from on-chain storage */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <span
            className="mono-tag"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: 'var(--color-panel)',
              padding: '0.2rem 0.55rem',
              border: '1.5px solid var(--color-border)',
              borderRadius: '2px'
            }}
          >
            ON-CHAIN ID #{id}
          </span>
          {isVotedByMe ? (
            <StatusBadge variant="verified">★ YOUR BALLOT</StatusBadge>
          ) : (
            <>
              {isOngoing && <StatusBadge variant="ongoing">Active Ballot</StatusBadge>}
              {electionState === 2 && <StatusBadge variant="ended">Final Result</StatusBadge>}
              {electionState === 0 && <StatusBadge variant="not-started">Registered</StatusBadge>}
            </>
          )}
        </div>

        {/* Candidate Identity with Neutral Offline SVG Seal */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              flexShrink: 0,
              backgroundColor: 'var(--color-panel)',
              border: '2px solid var(--color-border)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0px #1C1B1A'
            }}
          >
            {/* Neutral geometric SVG seal (100% offline) */}
            <svg width="38" height="38" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="36" height="36" rx="4" stroke="#1C1B1A" strokeWidth="1.5" fill="#FAF8F4" />
              <circle cx="20" cy="20" r="13" stroke={accentColor} strokeWidth="1.5" strokeDasharray="3 3" />
              <text
                x="20"
                y="25"
                textAnchor="middle"
                fontFamily="var(--font-serif)"
                fontWeight="bold"
                fontSize="13"
                fill="#1C1B1A"
              >
                {initials}
              </text>
            </svg>
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{name}</h3>
            <span
              className="mono-label"
              style={{
                fontSize: '0.7rem',
                color: 'var(--color-ink-muted)',
                backgroundColor: 'var(--color-panel)',
                padding: '0.1rem 0.4rem',
                border: '1px solid #D5CEBE',
                borderRadius: '2px'
              }}
            >
              Verified Candidate Name (Solidity)
            </span>
          </div>
        </div>

        {/* Perforated Divider */}
        <hr className="ink-rule-dashed" style={{ margin: '0.75rem 0 1rem 0' }} />

        {/* Verified On-Chain Vote Counts and Progress Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
            <span className="mono-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              ON-CHAIN TALLY
            </span>
            <span className="mono-tag" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              {voteCount} {voteCount === 1 ? 'Vote' : 'Votes'} ({percentage}%)
            </span>
          </div>
          <div className="vote-bar-container">
            <div
              className="vote-bar-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: accentColor
              }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div>
        {userRole === 'guest' && (
          <button
            type="button"
            className="btn btn-secondary"
            disabled
            style={{ width: '100%', fontSize: '0.8125rem' }}
          >
            Read-Only (Public Audit)
          </button>
        )}

        {userRole === 'voter_unvoted' && (
          canVote ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onVoteClick && onVoteClick(candidate)}
              style={{ width: '100%', fontSize: '0.875rem' }}
            >
              Cast Ballot
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              disabled
              title={votingDisabledReason || 'Voting Unavailable'}
              style={{ width: '100%', fontSize: '0.8125rem' }}
            >
              {votingDisabledReason || 'Voting Unavailable'}
            </button>
          )
        )}

        {userRole === 'voter_voted' && (
          isVotedByMe ? (
            <div
              className="paper-panel"
              style={{
                padding: '0.5rem',
                textAlign: 'center',
                backgroundColor: '#F3FCE7',
                border: '1.5px solid var(--color-chartreuse)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: '#214705'
              }}
            >
              ★ YOUR CAST BALLOT (RECORDED ON-CHAIN)
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              disabled
              style={{ width: '100%', fontSize: '0.8125rem' }}
            >
              Ballot Already Cast
            </button>
          )
        )}

        {userRole === 'admin' && (
          <div
            className="paper-panel"
            style={{
              padding: '0.4rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)'
            }}
          >
            Candidate #{id} Status: {electionState === 1 ? 'Voting Active' : 'Standby'}
          </div>
        )}
      </div>
    </div>
  );
}
